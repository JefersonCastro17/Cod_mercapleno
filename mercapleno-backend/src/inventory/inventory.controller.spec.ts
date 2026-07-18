import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { RegisterMovementDto } from './dto/register-movement.dto';
import { AuthUser } from '../auth/interfaces/auth-user.interface';

describe('InventoryController', () => {
  let controller: InventoryController;
  let inventoryService: jest.Mocked<Pick<InventoryService, 'getProductsWithStock' | 'getReferenceDocuments' | 'registerMovement'>>;

  beforeEach(() => {
    // 1. Creamos un objeto simulado (Mock) del servicio.
    // Esto evita llamar a la base de datos real.
    inventoryService = {
      getProductsWithStock: jest.fn(),
      getReferenceDocuments: jest.fn(),
      registerMovement: jest.fn(),
    } as unknown as jest.Mocked<Pick<InventoryService, 'getProductsWithStock' | 'getReferenceDocuments' | 'registerMovement'>>;

    // 2. Instanciamos el controlador inyectándole nuestro mock.
    controller = new InventoryController(inventoryService as unknown as InventoryService);
  });

  describe('getProductsWithStock', () => {
    it('debe retornar la lista de productos con stock obtenida del servicio', async () => {
      // Definimos la respuesta de mentira (Mock) que el servicio retornará.
      const mockResult = [
        { id: 1, nombre: 'Arroz', precio: 1500, stock: 10, lowStock: false, text: 'Stock normal' }
      ];
      inventoryService.getProductsWithStock.mockResolvedValue(mockResult as any);

      // Ejecutamos la acción del controlador.
      const result = await controller.getProductsWithStock();

      // Hacemos las comprobaciones (aserciones).
      expect(result).toBe(mockResult);
      expect(inventoryService.getProductsWithStock).toHaveBeenCalledTimes(1);
    });
  });

  describe('getReferenceDocuments', () => {
    it('debe llamar al servicio con el tipo de movimiento especificado', async () => {
      const mockResult = [{ id_documento: 'DOC-123', label: 'Factura 123', total_usos: 1 }];
      inventoryService.getReferenceDocuments.mockResolvedValue(mockResult as any);

      const query = { tipo_movimiento: 'ENTRADA' as const };
      const result = await controller.getReferenceDocuments(query);

      expect(result).toBe(mockResult);
      expect(inventoryService.getReferenceDocuments).toHaveBeenCalledWith('ENTRADA');
    });
  });

  describe('registerMovement', () => {
    it('debe registrar el movimiento con el ID del usuario actual', async () => {
      const mockResult = { success: true, message: 'Movimiento registrado' };
      inventoryService.registerMovement.mockResolvedValue(mockResult as any);

      const dto: RegisterMovementDto = {
        id_producto: 1,
        cantidad: 5,
        tipo_movimiento: 'ENTRADA',
        id_documento: 'DOC-123',
        comentario: 'Prueba unitaria'
      };
      const user: AuthUser = { id: 42, email: 'user@test.com', id_rol: 1 };

      const result = await controller.registerMovement(dto, user);

      expect(result).toBe(mockResult);
      expect(inventoryService.registerMovement).toHaveBeenCalledWith(dto, 42);
    });

    it('debe registrar el movimiento pasando undefined si no hay usuario', async () => {
      const mockResult = { success: true };
      inventoryService.registerMovement.mockResolvedValue(mockResult as any);

      const dto: RegisterMovementDto = {
        id_producto: 1,
        cantidad: 5,
        tipo_movimiento: 'ENTRADA',
        id_documento: 'DOC-123',
      };

      const result = await controller.registerMovement(dto, undefined);

      expect(result).toBe(mockResult);
      expect(inventoryService.registerMovement).toHaveBeenCalledWith(dto, undefined);
    });
  });
});
