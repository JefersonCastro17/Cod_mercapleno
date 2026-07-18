import '../../domain/entities/reference_document.dart';

class ReferenceDocumentModel extends ReferenceDocument {
  const ReferenceDocumentModel({
    required super.idDocumento,
    required super.label,
    required super.totalUsos,
  });

  factory ReferenceDocumentModel.fromJson(Map<String, dynamic> json) {
    return ReferenceDocumentModel(
      idDocumento: (json['id_documento'] ?? '') as String,
      label: (json['label'] ?? '') as String,
      totalUsos: (json['total_usos'] as num?)?.toInt() ?? 0,
    );
  }
}
