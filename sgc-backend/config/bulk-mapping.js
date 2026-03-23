/**
 * Centralized mapping for Massive Data Upload (8.1.0)
 * Excel Column (Spanish) -> Database Field (camelCase)
 */

module.exports = {
  // 1. Infraestructura (7.1.x)
  towers: {
    model: 'tower',
    uniqueKey: 'name',
    mapping: { 'nombre': 'name' }
  },
  unit_types: {
    model: 'tipoUnidad',
    uniqueKey: 'nombre',
    mapping: { 'nombre': 'nombre', 'gasto_base': 'baseCommonExpense', 'm2_defecto': 'defaultM2' }
  },
  departments: {
    model: 'department',
    uniqueKey: ['number', 'towerId'],
    relations: {
      'torre': { model: 'tower', field: 'name', target: 'towerId' },
      'tipo_unidad': { model: 'tipoUnidad', field: 'nombre', target: 'unitTypeId' }
    },
    mapping: {
      'numero': 'number', 'piso': 'floor', 'm2': 'm2', 'm2_terreno': 'terrainM2',
      'valor': 'value', 'dormitorios': 'dormitorios', 'banos': 'banos',
      'estacionamientos': 'estacionamientos', 'ano_construccion': 'yearBuilt',
      'disponible': 'isAvailable', 'tipo_publicacion': 'publishType', 'rol_sii': 'propertyRole'
    }
  },
  parking: {
    model: 'estacionamiento',
    uniqueKey: 'number',
    relations: { 'unidad': { model: 'department', field: 'number', target: 'departmentId' } },
    mapping: { 'numero': 'number', 'ubicacion': 'location', 'discapacitado': 'isHandicapped' }
  },

  // 2. Maestros base (7.2.x, 7.3.x)
  banks: {
    model: 'banco',
    uniqueKey: 'nombre',
    mapping: { 'nombre': 'nombre' }
  },
  pension_funds: {
    model: 'pensionFund',
    uniqueKey: 'name',
    mapping: { 'nombre': 'name', 'tasa': 'discountRate' }
  },
  health_providers: {
    model: 'healthProvider',
    uniqueKey: 'name',
    mapping: { 'nombre': 'name', 'tipo': 'type', 'tasa': 'discountRate' }
  },
  article_categories: {
    model: 'parametroSistema', // Note: mapped to parametroSistema in DB
    uniqueKey: ['type', 'nombre'],
    mapping: { 'nombre': 'nombre', 'descripcion': 'description' },
    fixedFields: { type: 'article_category', isActive: true }
  },
  emergency_numbers: {
    model: 'numeroEmergencia',
    uniqueKey: 'nombre',
    mapping: { 'nombre': 'nombre', 'telefono': 'phone', 'categoria': 'category', 'descripcion': 'description' }
  },

  // 3. Comunidad (5.3.x)
  residents: {
    model: 'residente',
    uniqueKey: 'dni',
    mapping: {
      'nombres': 'names', 'apellidos': 'lastNames', 'rut': 'dni', 'email': 'email',
      'telefono': 'phone', 'integrantes': 'familyCount', 'mascotas': 'hasPets',
      'arrendatario': 'isTenant', 'monto_arriendo': 'rentAmount', 'observaciones': 'notes'
    }
  },
  owners: {
    model: 'propietario',
    uniqueKey: 'dni',
    mapping: {
      'nombres': 'names', 'apellidos': 'lastNames', 'rut': 'dni', 'email': 'email',
      'telefono': 'phone', 'notificaciones': 'receiveResidentNotifications',
      'ver_deudas': 'canResidentSeeArrears'
    }
  },

  // 4. Módulos dependientes
  personnel: {
    model: 'personnel',
    uniqueKey: 'dni',
    mapping: {
      'nombres': 'names', 'apellidos': 'lastNames', 'rut': 'dni', 'cargo': 'position',
      'direccion': 'address', 'honorario': 'isHonorary', 'sueldo_base': 'baseSalary',
      'dias_vacaciones': 'vacationDays', 'telefono': 'phone', 'email': 'email'
    }
  },
  articles: {
    model: 'articulo',
    uniqueKey: 'nombre',
    mapping: {
      'nombre': 'nombre', 'descripcion': 'description', 'categoria': 'category',
      'precio': 'price', 'stock': 'stock', 'stock_minimo': 'minStock', 'activo': 'isActive'
    }
  },
  assets: {
    model: 'fixedAsset',
    uniqueKey: 'description',
    mapping: {
      'descripcion': 'description', 'modelo': 'model', 'precio_compra': 'purchasePrice',
      'valor_depreciado': 'depreciatedValue', 'fecha_compra': 'purchaseDate',
      'detalles': 'details', 'cantidad': 'quantity'
    }
  }
};

// ── SGC Standard aliases (Fase 1 refactoring) ──
const mapping = module.exports;
mapping['tipos_unidad']                  = mapping['unit_types'];
mapping['estacionamientos']              = mapping['parking'];
mapping['bancos']                        = mapping['banks'];
mapping['afps']                          = mapping['pension_funds'];
mapping['previsiones']                   = mapping['health_providers'];
mapping['maestro_categorias_articulos']  = mapping['article_categories'];
mapping['maestro_emergencias']           = mapping['emergency_numbers'];
mapping['articulos_personal']            = mapping['articles'];

