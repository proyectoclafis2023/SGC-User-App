/**
 * REGISTRO CENTRAL DE ENTIDADES - SGC v2.2.4
 * Define la correspondencia entre las tres capas: Excel, API y BD.
 * Incluye definiciones explícitas de relaciones para mapeo recursivo determinístico.
 */

const registry = {
    resident: {
        model: 'Residente',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'names', bd: 'names', excel: 'nombres' },
            { api: 'last_names', bd: 'lastNames', excel: 'apellidos' },
            { api: 'dni', bd: 'dni', excel: 'rut' },
            { api: 'email', bd: 'email', excel: 'correo' },
            { api: 'phone', bd: 'phone', excel: 'telefono' },
            { api: 'photo', bd: 'photo', excel: 'foto' },
            { api: 'tower_id', bd: 'towerId', excel: 'torre_id' },
            { api: 'unit_id', bd: 'unitId', excel: 'unidad_id' },
            { api: 'parking_ids', bd: 'parkingIds', excel: 'estacionamientos', isJson: true },
            { api: 'family_count', bd: 'familyCount', excel: 'integrantes_familia' },
            { api: 'has_pets', bd: 'hasPets', excel: 'tiene_mascotas' },
            { api: 'condition_ids', bd: 'conditionIds', excel: 'condiciones_especiales', isJson: true },
            { api: 'notes', bd: 'notes', excel: 'notas' },
            { api: 'is_tenant', bd: 'isTenant', excel: 'es_arrendatario' },
            { api: 'rent_amount', bd: 'rentAmount', excel: 'monto_arriendo' },
            { api: 'status', bd: 'status', excel: 'estado' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' },
            { api: 'created_at', bd: 'createdAt', excel: 'fecha_creacion' }
        ],
        relations: {
            departments: 'department'
        }
    },
    unit_type: {
        model: 'TipoUnidad',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'nombre', bd: 'nombre', excel: 'nombre' },
            { api: 'base_common_expense', bd: 'baseCommonExpense', excel: 'gasto_comun_base' },
            { api: 'default_m2', bd: 'defaultM2', excel: 'm2_por_defecto' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' }
        ],
        relations: {}
    },
    department: {
        model: 'Department',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'tower_id', bd: 'towerId', excel: 'torre_id' },
            { api: 'number', bd: 'number', excel: 'numero' },
            { api: 'floor', bd: 'floor', excel: 'piso' },
            { api: 'unit_type_id', bd: 'unitTypeId', excel: 'tipo_unidad_id' },
            { api: 'property_role', bd: 'propertyRole', excel: 'rol_propiedad' },
            { api: 'm2', bd: 'm2', excel: 'm2' },
            { api: 'terrain_m2', bd: 'terrainM2', excel: 'm2_terreno' },
            { api: 'value', bd: 'value', excel: 'valor' },
            { api: 'dormitorios', bd: 'dormitorios', excel: 'dormitorios' },
            { api: 'banos', bd: 'banos', excel: 'banos' },
            { api: 'estacionamientos', bd: 'estacionamientos', excel: 'estacionamientos' },
            { api: 'year_built', bd: 'yearBuilt', excel: 'ano_construccion' },
            { api: 'is_available', bd: 'isAvailable', excel: 'disponible' },
            { api: 'publish_type', bd: 'publishType', excel: 'tipo_publicacion' },
            { api: 'image', bd: 'image', excel: 'imagen' },
            { api: 'location_map_url', bd: 'locationMapUrl', excel: 'mapa_ubicacion' },
            { api: 'water_client_id', bd: 'waterClientId', excel: 'cliente_agua' },
            { api: 'electricity_client_id', bd: 'electricityClientId', excel: 'cliente_luz' },
            { api: 'gas_client_id', bd: 'gasClientId', excel: 'cliente_gas' },
            { api: 'owner_id', bd: 'ownerId', excel: 'propietario_id' },
            { api: 'resident_id', bd: 'residentId', excel: 'residente_id' },
            { api: 'last_census_date', bd: 'lastCensusDate', excel: 'ultimo_censo' },
            { api: 'history', bd: 'historyJson', excel: 'historial', isJson: true },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' }
        ],
        relations: {
            tower: 'tower',
            unitType: 'unit_type',
            resident: 'resident',
            owner: 'owner',
            bodegas: 'storage'
        }
    },
    storage: {
        model: 'Bodega',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'number', bd: 'number', excel: 'numero' },
            { api: 'location', bd: 'location', excel: 'ubicacion' },
            { api: 'department_id', bd: 'departmentId', excel: 'departamento_id' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' }
        ],
        relations: {
            department: 'department'
        }
    },
    tower: {
        model: 'Tower',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'name', bd: 'name', excel: 'nombre' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' }
        ],
        relations: {
            departments: 'department'
        }
    },
    parking: {
        model: 'Estacionamiento',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'number', bd: 'number', excel: 'numero' },
            { api: 'location', bd: 'location', excel: 'ubicacion' },
            { api: 'is_handicapped', bd: 'isHandicapped', excel: 'discapacitado' },
            { api: 'department_id', bd: 'departmentId', excel: 'departamento_id' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' }
        ],
        relations: {
            department: 'department'
        }
    },
    bank: {
        model: 'Banco',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'name', bd: 'nombre', excel: 'nombre' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' }
        ],
        relations: {}
    },
    owner: {
        model: 'Propietario',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'names', bd: 'names', excel: 'nombres' },
            { api: 'last_names', bd: 'lastNames', excel: 'apellidos' },
            { api: 'dni', bd: 'dni', excel: 'rut' },
            { api: 'email', bd: 'email', excel: 'correo' },
            { api: 'phone', bd: 'phone', excel: 'telefono' },
            { api: 'receive_resident_notifications', bd: 'receiveResidentNotifications', excel: 'notificaciones_residente' },
            { api: 'can_resident_see_arrears', bd: 'canResidentSeeArrears', excel: 'ver_deuda_residente' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' },
            { api: 'created_at', bd: 'createdAt', excel: 'fecha_creacion' }
        ],
        relations: {
            departments: 'department'
        }
    },
    common_space: {
        model: 'EspacioComun',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'name', bd: 'nombre', excel: 'nombre' },
            { api: 'location', bd: 'location', excel: 'ubicacion' },
            { api: 'rental_value', bd: 'rentalValue', excel: 'valor_arriendo' },
            { api: 'duration_hours', bd: 'durationHours', excel: 'duracion_horas' },
            { api: 'conditions', bd: 'conditions', excel: 'condiciones' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' }
        ],
        relations: {}
    },
    health_provider: {
        model: 'HealthProvider',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'name', bd: 'name', excel: 'nombre' },
            { api: 'type', bd: 'type', excel: 'tipo' },
            { api: 'discount_rate', bd: 'discountRate', excel: 'tasa_descuento' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' }
        ],
        relations: {
            personnel: 'personnel'
        }
    },
    pension_fund: {
        model: 'PensionFund',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'name', bd: 'name', excel: 'nombre' },
            { api: 'discount_rate', bd: 'discountRate', excel: 'tasa_descuento' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' }
        ],
        relations: {
            personnel: 'personnel'
        }
    },
    afc: {
        model: 'Afc',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'name', bd: 'name', excel: 'nombre' },
            { api: 'fixed_term_rate', bd: 'fixedTermRate', excel: 'tasa_plazo_fijo' },
            { api: 'indefinite_term_rate', bd: 'indefiniteTermRate', excel: 'tasa_indefinido' },
            { api: 'is_active', bd: 'isActive', excel: 'activo' },
            { api: 'created_at', bd: 'createdAt', excel: 'fecha_creacion' }
        ],
        relations: {
            personnel: 'personnel'
        }
    },
    ipc_projection: {
        model: 'ProyeccionIPC',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'name', bd: 'nombre', excel: 'nombre' },
            { api: 'ipc_rate', bd: 'ipcRate', excel: 'tasa_ipc' },
            { api: 'ponderado_rate', bd: 'ponderadoRate', excel: 'tasa_ponderado' },
            { api: 'description', bd: 'description', excel: 'descripcion' },
            { api: 'is_active', bd: 'isActive', excel: 'activo' }
        ],
        relations: {}
    },
    system_parameter: {
        model: 'ParametroSistema',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'type', bd: 'type', excel: 'tipo' },
            { api: 'name', bd: 'nombre', excel: 'nombre' },
            { api: 'description', bd: 'description', excel: 'descripcion' },
            { api: 'is_active', bd: 'isActive', excel: 'activo' }
        ],
        relations: {}
    },
    camera: {
        model: 'Camera',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'name', bd: 'name', excel: 'nombre' },
            { api: 'description', bd: 'description', excel: 'descripcion' },
            { api: 'backup_hours', bd: 'backupHours', excel: 'horas_respaldo' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' }
        ],
        relations: {}
    },
    communication: {
        model: 'CommunicationHistory',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'subject', bd: 'subject', excel: 'asunto' },
            { api: 'message', bd: 'message', excel: 'mensaje' },
            { api: 'recipients', bd: 'recipients', excel: 'destinatarios' },
            { api: 'sender_id', bd: 'senderId', excel: 'remitente_id' },
            { api: 'target_filter', bd: 'targetFilter', excel: 'filtro_objetivo' },
            { api: 'attachment_url', bd: 'attachmentUrl', excel: 'archivo_adjunto' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' },
            { api: 'created_at', bd: 'createdAt', excel: 'fecha_creacion' }
        ],
        relations: {}
    },
    communication_template: {
        model: 'PlantillaComunicacion',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'name', bd: 'nombre', excel: 'nombre' },
            { api: 'subject', bd: 'subject', excel: 'asunto' },
            { api: 'message', bd: 'message', excel: 'mensaje' },
            { api: 'type', bd: 'type', excel: 'tipo' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' }
        ],
        relations: {}
    },
    emergency_number: {
        model: 'NumeroEmergencia',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'name', bd: 'nombre', excel: 'nombre' },
            { api: 'phone', bd: 'phone', excel: 'telefono' },
            { api: 'category', bd: 'category', excel: 'categoria' },
            { api: 'description', bd: 'description', excel: 'descripcion' },
            { api: 'web_url', bd: 'webUrl', excel: 'web_url' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' },
            { api: 'created_at', bd: 'createdAt', excel: 'fecha_creacion' }
        ],
        relations: {}
    },
    condo_board: {
        model: 'Comite',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'name', bd: 'name', excel: 'nombre' },
            { api: 'position', bd: 'position', excel: 'cargo' },
            { api: 'dni', bd: 'dni', excel: 'rut' },
            { api: 'address', bd: 'address', excel: 'direccion' },
            { api: 'email', bd: 'email', excel: 'correo' },
            { api: 'phone', bd: 'phone', excel: 'telefono' },
            { api: 'photo', bd: 'photo', excel: 'foto' },
            { api: 'signature_photo', bd: 'signaturePhoto', excel: 'firma' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' },
            { api: 'created_at', bd: 'createdAt', excel: 'fecha_creacion' }
        ]
    },
    special_condition: {
        model: 'CondicionEspecial',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'name', bd: 'nombre', excel: 'nombre' },
            { api: 'description', bd: 'description', excel: 'descripcion' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' }
        ],
        relations: {}
    },
    system_announcement: {
        model: 'Aviso',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'text', bd: 'text', excel: 'texto' },
            { api: 'type', bd: 'type', excel: 'tipo' },
            { api: 'is_active', bd: 'isActive', excel: 'activo' },
            { api: 'image', bd: 'image', excel: 'imagen' },
            { api: 'youtube_url', bd: 'youtubeUrl', excel: 'youtube_url' },
            { api: 'duration_seconds', bd: 'durationSeconds', excel: 'duracion_segundos' },
            { api: 'is_full_image', bd: 'isFullImage', excel: 'imagen_completa' },
            { api: 'expires_at', bd: 'expiresAt', excel: 'fecha_expiracion' },
            { api: 'tags', bd: 'tags', excel: 'etiquetas' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' },
            { api: 'created_at', bd: 'createdAt', excel: 'fecha_creacion' }
        ]
    },
    daily_report: {
        model: 'DailyReport',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'folio', bd: 'folio', excel: 'folio' },
            { api: 'worker_id', bd: 'workerId', excel: 'funcionario_id' },
            { api: 'worker_name', bd: 'workerName', excel: 'funcionario_nombre' },
            { api: 'shift_date', bd: 'shiftDate', excel: 'fecha_turno' },
            { api: 'shift_type', bd: 'shiftType', excel: 'tipo_turno' },
            { api: 'novedades', bd: 'novedades', excel: 'novedades' },
            { api: 'has_incidents', bd: 'hasIncidents', excel: 'hay_incidencias' },
            { api: 'incident_details', bd: 'incidentDetails', excel: 'detalle_incidencias' },
            { api: 'incident_attachments', bd: 'incidentAttachments', excel: 'adjuntos_incidencias' },
            { api: 'has_infrastructure_issues', bd: 'hasInfrastructureIssues', excel: 'hay_problemas_infra' },
            { api: 'infrastructure_issue_types', bd: 'infrastructureIssueTypes', excel: 'tipos_problemas_infra' },
            { api: 'infrastructure_issue_details', bd: 'infrastructureIssueDetails', excel: 'detalle_problemas_infra' },
            { api: 'infrastructure_attachments', bd: 'infrastructureAttachments', excel: 'adjuntos_infra' },
            { api: 'has_equipment_issues', bd: 'hasEquipmentIssues', excel: 'hay_problemas_equip' },
            { api: 'equipment_issue_types', bd: 'equipmentIssueTypes', excel: 'tipos_problemas_equip' },
            { api: 'equipment_issue_details', bd: 'equipmentIssueDetails', excel: 'detalle_problemas_equip' },
            { api: 'equipment_attachments', bd: 'equipmentAttachments', excel: 'adjuntos_equip' },
            { api: 'status', bd: 'status', excel: 'estado' },
            { api: 'closed_at', bd: 'closedAt', excel: 'fecha_cierre' },
            { api: 'admin_reopened_by', bd: 'adminReopenedBy', excel: 'reabierto_por' },
            { api: 'admin_reopen_reason', bd: 'adminReopenReason', excel: 'motivo_reapertura' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' },
            { api: 'created_at', bd: 'createdAt', excel: 'fecha_creacion' },
            { api: 'resident_id', bd: 'residentId', excel: 'residente_id' },
            { api: 'owner_id', bd: 'ownerId', excel: 'propietario_id' },
            { api: 'department_id', bd: 'departmentId', excel: 'unidad_id' }
        ],
        relations: {
            resident: { entity: 'resident' },
            owner: { entity: 'owner' },
            department: { entity: 'department' }
        }
    },
    shift_log: {
        model: 'ShiftLog',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'daily_report_id', bd: 'dailyReportId', excel: 'reporte_id' },
            { api: 'timestamp', bd: 'timestamp', excel: 'timestamp' },
            { api: 'event', bd: 'event', excel: 'evento' },
            { api: 'category', bd: 'category', excel: 'categoria' },
            { api: 'worker_id', bd: 'workerId', excel: 'funcionario_id' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' },
            { api: 'created_at', bd: 'createdAt', excel: 'fecha_creacion' }
        ],
        relations: {
            daily_report: { entity: 'daily_report' }
        }
    },
    visit: {
        model: 'Visita',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'folio', bd: 'folio', excel: 'folio' },
            { api: 'names', bd: 'names', excel: 'nombres' },
            { api: 'dni', bd: 'dni', excel: 'dni' },
            { api: 'resident_id', bd: 'residentId', excel: 'residente_id' },
            { api: 'tower_id', bd: 'towerId', excel: 'torre_id' },
            { api: 'department_id', bd: 'departmentId', excel: 'unidad_id' },
            { api: 'visit_date', bd: 'visitDate', excel: 'fecha_visita' },
            { api: 'visit_time', bd: 'visitTime', excel: 'hora_visita' },
            { api: 'is_pre_registered', bd: 'isPreRegistered', excel: 'pre_registrado' },
            { api: 'status', bd: 'status', excel: 'estado' },
            { api: 'entry_at', bd: 'entryTime', excel: 'hora_entrada' },
            { api: 'exit_at', bd: 'exitTime', excel: 'hora_salida' },
            { api: 'vehicle_plate', bd: 'vehiclePlate', excel: 'patente' },
            { api: 'notes', bd: 'notes', excel: 'notas' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' },
            { api: 'created_at', bd: 'createdAt', excel: 'fecha_creacion' }
        ],
        relations: {
            resident: { entity: 'resident' },
            department: { entity: 'department' }
        }
    },
    package: {
        model: 'Correspondence',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'folio', bd: 'folio', excel: 'folio' },
            { api: 'department_id', bd: 'departmentId', excel: 'unidad_id' },
            { api: 'tower_id', bd: 'towerId', excel: 'torre_id' },
            { api: 'type', bd: 'type', excel: 'tipo' },
            { api: 'addressee', bd: 'addressee', excel: 'destinatario' },
            { api: 'status', bd: 'status', excel: 'estado' },
            { api: 'received_at', bd: 'receivedAt', excel: 'fecha_recepcion' },
            { api: 'delivered_at', bd: 'deliveredAt', excel: 'fecha_entrega' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' },
            { api: 'created_at', bd: 'createdAt', excel: 'fecha_creacion' }
        ],
        relations: {
            department: { entity: 'department' }
        }
    },
    contractor: {
        model: 'ContratistaVisita',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'folio', bd: 'folio', excel: 'folio' },
            { api: 'names', bd: 'names', excel: 'nombres' },
            { api: 'dni', bd: 'dni', excel: 'dni' },
            { api: 'company', bd: 'company', excel: 'empresa' },
            { api: 'subject', bd: 'subject', excel: 'asunto' },
            { api: 'department_id', bd: 'departmentId', excel: 'unidad_id' },
            { api: 'status', bd: 'status', excel: 'estado' },
            { api: 'entry_at', bd: 'entryAt', excel: 'fecha_entrada' },
            { api: 'exit_at', bd: 'exitAt', excel: 'fecha_salida' },
            { api: 'allowed_until', bd: 'allowedUntil', excel: 'permitido_hasta' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' },
            { api: 'created_at', bd: 'createdAt', excel: 'fecha_creacion' }
        ],
        relations: {
            department: { entity: 'department' }
        }
    },
    supply_request: {
        model: 'SupplyRequest',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'folio', bd: 'folio', excel: 'folio' },
            { api: 'name', bd: 'name', excel: 'nombre' },
            { api: 'description', bd: 'description', excel: 'descripcion' },
            { api: 'requested_by', bd: 'requestedBy', excel: 'solicitante_id' },
            { api: 'status', bd: 'status', excel: 'estado' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' },
            { api: 'created_at', bd: 'createdAt', excel: 'fecha_creacion' }
        ],
        relations: {
            personal: { entity: 'personal' }
        }
    },
    camera: {
        model: 'Camera',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'name', bd: 'name', excel: 'nombre' },
            { api: 'description', bd: 'description', excel: 'descripcion' },
            { api: 'backup_hours', bd: 'backupHours', excel: 'horas_respaldo' },
            { api: 'is_active', bd: 'isActive', excel: 'activo' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' },
            { api: 'created_at', bd: 'createdAt', excel: 'fecha_creacion' }
        ]
    },
    cctv_log: {
        model: 'CctvLog',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'folio', bd: 'folio', excel: 'folio' },
            { api: 'camera_id', bd: 'cameraId', excel: 'camara_id' },
            { api: 'event_type', bd: 'eventType', excel: 'tipo_evento' },
            { api: 'description', bd: 'description', excel: 'descripcion' },
            { api: 'recorded_at', bd: 'recordedAt', excel: 'fecha_registro' },
            { api: 'evidence_url', bd: 'evidenceUrl', excel: 'url_evidencia' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' },
            { api: 'created_at', bd: 'createdAt', excel: 'fecha_creacion' }
        ],
        relations: {
            camera: { entity: 'camera' }
        }
    },
    reservation: {
        model: 'Reserva',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'folio', bd: 'folio', excel: 'folio' },
            { api: 'common_space_id', bd: 'commonSpaceId', excel: 'espacio_id' },
            { api: 'resident_id', bd: 'residentId', excel: 'residente_id' },
            { api: 'start_at', bd: 'startAt', excel: 'fecha_inicio' },
            { api: 'end_at', bd: 'endAt', excel: 'fecha_fin' },
            { api: 'status', bd: 'status', excel: 'estado' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' },
            { api: 'created_at', bd: 'createdAt', excel: 'fecha_creacion' }
        ],
        relations: {
            common_space: { entity: 'common_space' },
            resident: { entity: 'resident' }
        }
    },
    support_ticket: {
        model: 'Ticket',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'folio', bd: 'folio', excel: 'folio' },
            { api: 'resident_id', bd: 'residentId', excel: 'residente_id' },
            { api: 'unit_id', bd: 'unitId', excel: 'unidad_id' },
            { api: 'tower_id', bd: 'towerId', excel: 'torre_id' },
            { api: 'type', bd: 'type', excel: 'tipo' },
            { api: 'subject', bd: 'subject', excel: 'asunto' },
            { api: 'description', bd: 'description', excel: 'descripcion' },
            { api: 'image', bd: 'image', excel: 'imagen' },
            { api: 'status', bd: 'status', excel: 'estado' },
            { api: 'admin_notes', bd: 'adminNotes', excel: 'notas_admin' },
            { api: 'acknowledged_at', bd: 'acknowledgedAt', excel: 'fecha_acuse' },
            { api: 'acknowledged_by', bd: 'acknowledgedBy', excel: 'autor_acuse' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' },
            { api: 'created_at', bd: 'createdAt', excel: 'fecha_creacion' },
            { api: 'updated_at', bd: 'updatedAt', excel: 'fecha_actualizacion' }
        ],
        relations: {
            resident: { entity: 'resident' }
        }
    },
    service_directory: {
        model: 'DirectorioServicio',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'name', bd: 'name', excel: 'nombre' },
            { api: 'category', bd: 'category', excel: 'categoria' },
            { api: 'contact_phone', bd: 'contactPhone', excel: 'telefono' },
            { api: 'contact_email', bd: 'contactEmail', excel: 'email' },
            { api: 'description', bd: 'description', excel: 'descripcion' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' },
            { api: 'created_at', bd: 'createdAt', excel: 'fecha_creacion' },
            { api: 'updated_at', bd: 'updatedAt', excel: 'fecha_actualizacion' }
        ]
    },
    personnel: {
        model: 'Personnel',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'names', bd: 'names', excel: 'nombres' },
            { api: 'last_names', bd: 'lastNames', excel: 'apellidos' },
            { api: 'dni', bd: 'dni', excel: 'rut' },
            { api: 'phone', bd: 'phone', excel: 'telefono' },
            { api: 'email', bd: 'email', excel: 'correo' },
            { api: 'photo', bd: 'photo', excel: 'foto' },
            { api: 'is_honorary', bd: 'isHonorary', excel: 'honorario' },
            { api: 'bank_id', bd: 'bankId', excel: 'banco_id' },
            { api: 'account_number', bd: 'accountNumber', excel: 'numero_cuenta' },
            { api: 'base_salary', bd: 'baseSalary', excel: 'sueldo_base' },
            { api: 'vacation_days', bd: 'vacationDays', excel: 'dias_vacaciones' },
            { api: 'vacation_last_update', bd: 'vacationLastUpdate', excel: 'ultima_actualizacion_vacaciones' },
            { api: 'health_provider_id', bd: 'healthProviderId', excel: 'prevision_id' },
            { api: 'has_complementary_insurance', bd: 'hasComplementaryInsurance', excel: 'tiene_seguro_complementario' },
            { api: 'complementary_insurance_type', bd: 'complementaryInsuranceType', excel: 'tipo_seguro_complementario' },
            { api: 'complementary_insurance_value', bd: 'complementaryInsuranceValue', excel: 'valor_seguro_complementario' },
            { api: 'pension_fund_id', bd: 'pensionFundId', excel: 'afp_id' },
            { api: 'has_apv', bd: 'hasAPV', excel: 'tiene_apv' },
            { api: 'apv_type', bd: 'apvType', excel: 'tipo_apv' },
            { api: 'apv_value', bd: 'apvValue', excel: 'valor_apv' },
            { api: 'jornada_group_id', bd: 'jornadaGroupId', excel: 'grupo_jornada_id' },
            { api: 'address', bd: 'address', excel: 'direccion' },
            { api: 'role', bd: 'position', excel: 'cargo' },
            { api: 'medical_info', bd: 'medicalInfo', excel: 'informacion_medica' },
            { api: 'contract_type', bd: 'contractType', excel: 'tipo_contrato' },
            { api: 'assigned_shift', bd: 'assignedShift', excel: 'turno_asignado' },
            { api: 'has_emergency_contact', bd: 'hasEmergencyContact', excel: 'tiene_contacto_emergencia' },
            { api: 'emergency_contact', bd: 'emergencyContactJson', excel: 'contacto_emergencia', isJson: true },
            { api: 'assigned_articles_json', bd: 'assignedArticlesJson', excel: 'articulos_asignados', isJson: true },
            { api: 'status', bd: 'status', excel: 'estado' },
            { api: 'role_id', bd: 'roleId', excel: 'rol_id' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' },
            { api: 'created_at', bd: 'createdAt', excel: 'fecha_creacion' }
        ],
        relations: {
            bank: 'bank',
            pensionFund: 'pension_fund',
            healthProvider: 'health_provider',
            supplyRequests: 'supply_request',
            articleDeliveries: 'inventory_item',
            role_ref: 'role'
        }
    },
    article: {
        model: 'Articulo',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'name', bd: 'nombre', excel: 'nombre' },
            { api: 'description', bd: 'description', excel: 'descripcion' },
            { api: 'category', bd: 'category', excel: 'categoria' },
            { api: 'unit', bd: 'unit', excel: 'unidad' },
            { api: 'price', bd: 'price', excel: 'precio' },
            { api: 'stock', bd: 'stock', excel: 'stock' },
            { api: 'min_stock', bd: 'minStock', excel: 'stock_minimo' },
            { api: 'is_active', bd: 'isActive', excel: 'activo' },
            { api: 'allow_personnel_request', bd: 'allowPersonnelRequest', excel: 'solicitable_por_personal' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' },
            { api: 'created_at', bd: 'createdAt', excel: 'fecha_creacion' }
        ]
    },
    inventory_item: {
        model: 'EntregaArticulo',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'folio', bd: 'folio', excel: 'folio' },
            { api: 'assigned_to', bd: 'personnelId', excel: 'asignado_a' },
            { api: 'delivery_date', bd: 'deliveryDate', excel: 'fecha_entrega' },
            { api: 'articles', bd: 'articlesJson', excel: 'articulos', isJson: true },
            { api: 'notes', bd: 'notes', excel: 'notas' },
            { api: 'status', bd: 'status', excel: 'estado' },
            { api: 'signed_document', bd: 'signedDocument', excel: 'documento_firmado' },
            { api: 'created_at', bd: 'createdAt', excel: 'fecha_creacion' }
        ],
        relations: {
            personnel: 'personnel'
        }
    },
    common_expense: {
        model: 'CommonExpense',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'total_amount', bd: 'totalAmount', excel: 'monto_total' },
            { api: 'period', bd: 'period', excel: 'periodo' },
            { api: 'calculated_at', bd: 'calculatedAt', excel: 'fecha_calculo' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' },
            { api: 'created_at', bd: 'createdAt', excel: 'fecha_creacion' }
        ],
        relations: {
            payments: 'common_expense_payment'
        }
    },
    common_expense_payment: {
        model: 'CommonExpensePayment',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'department_id', bd: 'departmentId', excel: 'departamento_id' },
            { api: 'common_expense_id', bd: 'commonExpenseId', excel: 'gasto_comun_id' },
            { api: 'period_month', bd: 'periodMonth', excel: 'mes' },
            { api: 'period_year', bd: 'periodYear', excel: 'anio' },
            { api: 'amount_paid', bd: 'amountPaid', excel: 'monto_pagado' },
            { api: 'payment_date', bd: 'paymentDate', excel: 'fecha_pago' },
            { api: 'status', bd: 'status', excel: 'estado' },
            { api: 'payment_method', bd: 'paymentMethod', excel: 'metodo_pago' },
            { api: 'receipt_folio', bd: 'receiptFolio', excel: 'folio_recibo' },
            { api: 'evidence_image', bd: 'evidenceImage', excel: 'comprobante' },
            { api: 'notes', bd: 'notes', excel: 'notas' },
            { api: 'is_electronic', bd: 'isElectronic', excel: 'electronico' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' },
            { api: 'created_at', bd: 'createdAt', excel: 'fecha_creacion' },
            { api: 'fund_contributions', bd: 'fundContributionsJson', excel: 'fondos', isJson: true }
        ],
        relations: {
            department: 'department',
            common_expense: 'common_expense'
        }
    },
    expense: {
        model: 'CommunityExpense',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'amount', bd: 'amount', excel: 'monto' },
            { api: 'expense_date', bd: 'date', excel: 'fecha' },
            { api: 'description', bd: 'description', excel: 'glosa' },
            { api: 'category_id', bd: 'categoryId', excel: 'categoria_id' },
            { api: 'category_name', bd: 'category', excel: 'categoria' },
            { api: 'payment_method', bd: 'paymentMethod', excel: 'metodo_pago' },
            { api: 'reference', bd: 'reference', excel: 'folio' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' },
            { api: 'is_projected', bd: 'isProjected', excel: 'proyectivo' },
            { api: 'receipt_url', bd: 'receiptUrl', excel: 'boleta_url' },
            { api: 'created_at', bd: 'createdAt', excel: 'fecha_creacion' }
        ],
        relations: {}
    },
    charge_rule: {
        model: 'ChargeRule',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'name', bd: 'name', excel: 'nombre' },
            { api: 'rule_type', bd: 'ruleType', excel: 'tipo' },
            { api: 'value', bd: 'value', excel: 'valor' },
            { api: 'applies_to', bd: 'appliesTo', excel: 'aplica_a' },
            { api: 'target_id', bd: 'targetId', excel: 'objetivo_id' },
            { api: 'is_active', bd: 'isActive', excel: 'activo' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' },
            { api: 'created_at', bd: 'createdAt', excel: 'fecha_creacion' }
        ],
        relations: {}
    },
    payment: {
        model: 'Payment',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'amount', bd: 'amount', excel: 'monto' },
            { api: 'payment_date', bd: 'paymentDate', excel: 'fecha_pago' },
            { api: 'payment_method', bd: 'paymentMethod', excel: 'metodo' },
            { api: 'reference', bd: 'reference', excel: 'referencia' },
            { api: 'resident_id', bd: 'residentId', excel: 'residente_id' },
            { api: 'department_id', bd: 'departmentId', excel: 'departamento_id' },
            { api: 'common_expense_payment_id', bd: 'commonExpensePaymentId', excel: 'deuda_id' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' },
            { api: 'created_at', bd: 'createdAt', excel: 'fecha_creacion' }
        ],
        relations: {
            resident: 'personnel',
            common_expense_payment: 'common_expense_payment'
        }
    },
    role: {
        model: 'Role',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'name', bd: 'name', excel: 'nombre' },
            { api: 'description', bd: 'description', excel: 'descripcion' },
            { api: 'is_archived', bd: 'isArchived', excel: 'archivado' },
            { api: 'created_at', bd: 'createdAt', excel: 'fecha_creacion' }
        ],
        relations: {
            personnel: 'personnel'
        }
    },
    permission: {
        model: 'Permission',
        fields: [
            { api: 'id', bd: 'id', excel: 'id' },
            { api: 'slug', bd: 'slug', excel: 'identificador' },
            { api: 'description', bd: 'description', excel: 'descripcion' }
        ],
        relations: {}
    }
};

module.exports = registry;
