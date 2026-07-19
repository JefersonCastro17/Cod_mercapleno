/// <reference types="jest" />

import { Test } from '@nestjs/testing';
import { MysqlService } from '../../common/database/mysql.service';
import { EmailService } from '../../email/email.service';
import { SalesService } from '../../sales/sales.service';

describe('SalesService - getFilteredProducts', () => {
	let service: SalesService;
	let mockMysql: { query: jest.Mock };

	beforeEach(async () => {
		/// <reference types="jest" />

		import { Test } from '@nestjs/testing';
		import { MysqlService } from '../../common/database/mysql.service';
		import { EmailService } from '../../email/email.service';
		import { SalesService } from '../../sales/sales.service';

		describe('SalesService - getFilteredProducts', () => {
			it('unidad: mapea filas de db a dto de producto', async () => {
				const mockMysql: { query: jest.Mock } = { query: jest.fn() } as any;
				const svc = new SalesService(mockMysql as any, {} as any);

				const rows = [
					{ id: 1, nombre: 'producto a', descripcion: null, precio: '1.245', category: 'Abarrotes', image: 'img.png', stock: 10 },
				];

				mockMysql.query.mockResolvedValue([rows]);
				const res = await svc.getFilteredProducts({});
				expect(res).toHaveLength(1);
				expect(res[0].id).toBe('1');
				expect(res[0].price).toBeCloseTo(123.45);
			});
		})