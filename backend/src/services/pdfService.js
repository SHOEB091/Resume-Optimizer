import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

// Compile LaTeX to PDF using two public services with timeouts and fallback.
export async function compileLatexToPdf(latex, id, downloadsDir) {
	const pdfPath = path.join(downloadsDir, `${id}.pdf`);

	const rtexCall = async () => {
		const { data } = await axios.post(
			'https://rtex.probablyaweb.site/api/v2',
			{ code: latex, format: 'pdf' },
			{ timeout: 60000 }
		);
		if (data?.status === 'success' && data?.result) {
			const buff = Buffer.from(data.result, 'base64');
			await fs.writeFile(pdfPath, buff);
			return { pdfPath };
		}
		throw new Error('rtex returned non-success status');
	};

	const latexOnlineCall = async () => {
		const url = `https://latexonline.cc/compile?text=${encodeURIComponent(latex)}`;
		const resp = await axios.get(url, { responseType: 'arraybuffer', timeout: 60000 });
		const contentType = resp.headers['content-type'] || '';
		if (contentType.includes('application/pdf')) {
			await fs.writeFile(pdfPath, Buffer.from(resp.data));
			return { pdfPath };
		}
		// Even if not a PDF, provide an external link the client can try
		return { pdfPath: undefined, pdfExternalUrl: url };
	};

	const tryWithRetry = async (fn, attempts = 2) => {
		let lastErr;
		for (let i = 0; i < attempts; i++) {
			try { return await fn(); } catch (e) { lastErr = e; }
		}
		throw lastErr;
	};

	// 1) rtex API (base64 response)
		try {
			const res = await tryWithRetry(rtexCall, 2);
			if (res?.pdfPath) return res.pdfPath;
		} catch (err) {
			console.warn('PDF compile via rtex failed:', err.message);
		}

	// 2) latexonline.cc text endpoint (binary PDF)
		try {
			const res = await tryWithRetry(latexOnlineCall, 2);
			if (res?.pdfPath) return res.pdfPath;
			if (res?.pdfExternalUrl) return res; // return object to surface external URL
			throw new Error('latexonline returned neither PDF nor URL');
		} catch (err) {
			console.warn('PDF compile via latexonline failed:', err.message);
			throw new Error('PDF compilation failed on all providers');
		}
}

