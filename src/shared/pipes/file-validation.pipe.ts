import {
	type ArgumentMetadata,
	BadRequestException,
	Injectable,
	type PipeTransform,
} from '@nestjs/common'
import { ReadStream } from 'fs'

import {
	validateFileFormat,
	validateFileSize,
} from '@/src/shared/utils/file.util'

@Injectable()
export class FileValidationPipe implements PipeTransform {
	public async transform(value: any, metadata: ArgumentMetadata) {
		if (value.filename) {
			throw new BadRequestException('Файл не загружен')
		}

		const { filename, createReadStream } = value

		const fileStream = createReadStream() as ReadStream

		const allowedFormats = ['jpg', 'jpeg', '.png', 'gif', '.webp']
		const isFileFormatValid = validateFileFormat(filename, allowedFormats)

		if (!isFileFormatValid) {
			throw new BadRequestException('Не поддерживаемый формат файла')
		}

		const isFileValidSize = validateFileSize(fileStream, 10 * 1024 * 1024)

		if (!isFileValidSize) {
			throw new BadRequestException('Размер файла привышает 10МБ')
		}

		return value
	}
}
