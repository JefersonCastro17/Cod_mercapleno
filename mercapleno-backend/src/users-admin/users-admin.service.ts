import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';

type UserWithRelations = Prisma.usuariosGetPayload<{
  include: { roles: true; tipos_identificacion: true };
}>;

@Injectable()
export class UsersAdminService {
  constructor(private readonly prisma: PrismaService) {}

  private parseUserId(id: string): number {
    const userId = Number(id);

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new BadRequestException({ success: false, message: 'Id de usuario invalido' });
    }

    return userId;
  }

  private handlePersistenceError(
    error: unknown,
    fallbackMessage: string,
    relationMessage: string,
  ): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException({ success: false, message: 'Ya existe un usuario con esos datos' });
      }

      if (error.code === 'P2003') {
        throw new ConflictException({ success: false, message: relationMessage });
      }
    }

    throw new InternalServerErrorException({ success: false, message: fallbackMessage });
  }

  async findAll() {
    const usuarios = await this.prisma.usuarios.findMany({
      include: {
        roles: true,
        tipos_identificacion: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return {
      success: true,
      usuarios: usuarios.map((user: UserWithRelations) => ({
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        direccion: user.direccion,
        fecha_nacimiento: user.fecha_nacimiento,
        rol: user.roles?.nombre ?? null,
        tipo_identificacion: user.tipos_identificacion?.nombre ?? null,
        numero_identificacion: user.numero_identificacion,
        id_rol: user.id_rol,
        id_tipo_identificacion: user.id_tipo_identificacion,
      })),
    };
  }

  async create(dto: CreateUserAdminDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      await this.prisma.usuarios.create({
        data: {
          nombre: dto.nombre,
          apellido: dto.apellido,
          email: dto.email,
          password: hashedPassword,
          direccion: dto.direccion,
          fecha_nacimiento: new Date(dto.fecha_nacimiento),
          id_rol: dto.id_rol,
          id_tipo_identificacion: dto.id_tipo_identificacion,
          numero_identificacion: dto.numero_identificacion,
          email_verified: dto.email_verified === false ? false : true,
        },
      });

      return { success: true, message: 'Usuario agregado correctamente' };
    } catch (error) {
      this.handlePersistenceError(
        error,
        'Error al insertar usuario',
        'No se pudo crear el usuario porque el rol o el tipo de identificacion no existen',
      );
    }
  }

  async update(id: string, dto: UpdateUserAdminDto) {
    const userId = this.parseUserId(id);
    const existing = await this.prisma.usuarios.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException({ success: false, message: 'Usuario no encontrado' });
    }

    const data: Prisma.usuariosUpdateInput = {
      ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
      ...(dto.apellido !== undefined ? { apellido: dto.apellido } : {}),
      ...(dto.email !== undefined ? { email: dto.email } : {}),
      ...(dto.direccion !== undefined ? { direccion: dto.direccion } : {}),
      ...(dto.fecha_nacimiento !== undefined ? { fecha_nacimiento: new Date(dto.fecha_nacimiento) } : {}),
      ...(dto.id_rol !== undefined ? { id_rol: dto.id_rol } : {}),
      ...(dto.id_tipo_identificacion !== undefined
        ? { id_tipo_identificacion: dto.id_tipo_identificacion }
        : {}),
      ...(dto.numero_identificacion !== undefined
        ? { numero_identificacion: dto.numero_identificacion }
        : {}),
    };

    if (dto.password !== undefined) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    if (Object.keys(data).length === 0) {
      return { success: true, message: 'Sin cambios para actualizar' };
    }

    try {
      await this.prisma.usuarios.update({
        where: { id: userId },
        data,
      });
    } catch (error) {
      this.handlePersistenceError(
        error,
        'Error al actualizar usuario',
        'No se pudo actualizar el usuario porque el rol o el tipo de identificacion no existen',
      );
    }

    return { success: true, message: 'Usuario actualizado correctamente' };
  }

  async remove(id: string) {
    const userId = this.parseUserId(id);
    const existing = await this.prisma.usuarios.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException({ success: false, message: 'Usuario no encontrado' });
    }

    try {
      await this.prisma.usuarios.delete({
        where: { id: userId },
      });
    } catch (error) {
      this.handlePersistenceError(
        error,
        'Error al eliminar usuario',
        'No se puede eliminar el usuario porque tiene registros asociados',
      );
    }

    return { success: true, message: 'Usuario eliminado correctamente' };
  }
}
