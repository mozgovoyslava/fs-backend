import { ReadStream } from 'fs'

export function validateFileFormat(
	filename: string,
	allowedFileFormats: string[],
): boolean {
	const fileExtension = filename.match(/\.([^.]+)$/)?.[1]?.toLowerCase()

	if (!fileExtension) {
		return false
	}

	return allowedFileFormats.some(
		format => format.replace(/^\./, '').toLowerCase() === fileExtension,
	)
}

export async function validateFileSize(
	fileStream: ReadStream,
	allowedFileSizeInBytes: number,
): Promise<boolean> {
	return new Promise((resolve, reject) => {
		let fileSizeInBytes = 0

		fileStream
			.on('data', (chunk: string | Buffer) => {
				fileSizeInBytes += Buffer.byteLength(chunk)
			})
			.on('end', () => {
				resolve(fileSizeInBytes <= allowedFileSizeInBytes)
			})
			.on('error', error => {
				reject(error)
			})
	})
}
