import 'package:mercapleno_appv1/features/auth/domain/entities/document_type.dart';

class DocumentTypeModel {
  const DocumentTypeModel({
    required this.id,
    required this.nombre,
  });

  final int id;
  final String nombre;

  factory DocumentTypeModel.fromJson(Map<String, dynamic> json) {
    return DocumentTypeModel(
      id: json['id'] is int ? json['id'] as int : int.tryParse('${json['id']}') ?? 0,
      nombre: json['nombre'] is String ? json['nombre'] as String : '',
    );
  }

  DocumentType toEntity() {
    return DocumentType(
      id: id,
      nombre: nombre,
    );
  }
}
