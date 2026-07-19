# Guía de Validación de Campos - Mercapleno Backend

## Resumen de Cambios

Se han mejorado las validaciones en los siguientes DTOs para prevenir entrada de datos inválidos:

### 1. **register.dto.ts** (Autenticación)
- ✅ Campo `numero_identificacion`: Ahora solo acepta dígitos (0-9)
  - Validador: `@Matches(/^\d+$/, { message: 'El número de identificación debe contener solo dígitos' })`

### 2. **create-user-admin.dto.ts** (Administración de Usuarios)
- ✅ Campo `numero_identificacion`: Ahora solo acepta dígitos (0-9)
  - Validador: `@Matches(/^\d+$/, { message: 'El número de identificación debe contener solo dígitos' })`

### 3. **register-movement.dto.ts** (Inventario)
- ✅ Campo `id_documento`: Ahora solo acepta dígitos (0-9)
  - Validador: `@Matches(/^\d+$/, { message: 'El ID de documento debe contener solo dígitos' })`

### 4. **create-product.dto.ts** (Productos)
- ✅ Campo `precio`: Agregado validador de mínimo (0)
  - Validador: `@Min(0)`
- ✅ Campo `estado`: Ahora solo acepta valores específicos
  - Validador: `@IsIn(['Disponible', 'Agotado'])`

---

## Mejores Prácticas de Validación

### Validadores Comúnmente Usados

```typescript
import { 
  IsString, 
  IsNumber, 
  IsInt,
  IsEmail,
  IsDateString,
  Matches,
  Min,
  Max,
  Length,
  MaxLength,
  MinLength,
  IsIn,
  IsOptional,
  IsArray,
  ValidateNested
} from 'class-validator';
```

### Patrones de Validación Recomendados

#### Campos Numéricos (Solo Dígitos)
```typescript
// Para campos que deben ser solo números
@Matches(/^\d+$/, { message: 'El campo debe contener solo dígitos' })
numero_identificacion: string;

// O si quieres permitir números con decimales
@Matches(/^\d+(\.\d{1,2})?$/, { message: 'Formato número inválido' })
precio: string;
```

#### Restricciones de Valores Numéricos
```typescript
@IsNumber()
@Min(0) // Mínimo 0
@Max(100) // Máximo 100
porcentaje: number;
```

#### Restricciones de Longitud
```typescript
@IsString()
@MinLength(6)
@MaxLength(20)
password: string;
```

#### Validación de Enumerados
```typescript
@IsString()
@IsIn(['PENDIENTE', 'EN_PROCESO', 'COMPLETADO'])
estado: string;
```

#### Campos Opcionales
```typescript
@IsOptional()
@IsString()
comentario?: string;
```

---

## Ejemplos de Errores de Validación Capturados

### Antes de los Cambios
```
// ❌ Permitía: "ABC123XYZ" en numero_identificacion
// ❌ Permitía: "-50" en precio
// ❌ Permitía: "estado_invalido" en estado
```

### Después de los Cambios
```
// ✅ Solo acepta: "123456789" en numero_identificacion
// ✅ Solo acepta: "50" o "50.99" en precio
// ✅ Solo acepta: "Disponible" o "Agotado" en estado

// Mensajes de error claros:
// "El número de identificación debe contener solo dígitos"
// "El ID de documento solo puede contener letras mayúsculas y números"
```

---

## Próximos Pasos Recomendados

1. **Revisar UpdateDto**: Aplicar las mismas validaciones a los DTOs de actualización
2. **Campos de Teléfono**: Agregar validación de formato de teléfono
   ```typescript
   @Matches(/^[\d\-\+\(\)\s]+$/, { message: 'Formato de teléfono inválido' })
   telefono: string;
   ```

3. **Campos de URL/Rutas**: 
   ```typescript
   @IsUrl()
   website: string;
   ```

4. **Crear DTO personalizado para números de teléfono si es común**
5. **Agregar mensajes de error en español consistentes**

---

## Testing de Validación

Para verificar que las validaciones funcionan correctamente, prueba con:

```bash
# Caso 1: Numero_identificacion con letras (debe fallar)
POST /auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "nombre": "Juan",
  "apellido": "Perez",
  "numero_identificacion": "ABC123", // ❌ Falla: contiene letras
  ...
}

# Caso 2: Numero_identificacion solo números (debe funcionar)
POST /auth/register
{
  ...
  "numero_identificacion": "123456789", // ✅ Funciona
  ...
}
```

---

## Notas importantes

- Los validadores se ejecutan automáticamente gracias a `ValidationPipe` de NestJS
- La validación ocurre antes de que el controlador procese los datos
- Los mensajes de error son personalizados y en español
- UpdateProductDto hereda automáticamente las validaciones de CreateProductDto (PartialType)

