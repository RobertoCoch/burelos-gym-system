/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // 1. Modificar equipo_gym
  const equipoCollection = app.findCollectionByNameOrId("pbc_888809168");
  
  // Agregar campo descripcion
  equipoCollection.fields.add(new Field({
    "hidden": false,
    "id": "text_desc_equipo",
    "name": "descripcion",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "text"
  }));

  // Agregar campo codigo_base
  equipoCollection.fields.add(new Field({
    "hidden": false,
    "id": "text_cod_base",
    "name": "codigo_base",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "text"
  }));

  app.save(equipoCollection);

  // 2. Crear nueva colección equipo_unidades
  const unidadesCollection = new Collection({
    "createRule": "",
    "deleteRule": "",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "cascadeDelete": true,
        "collectionId": equipoCollection.id,
        "hidden": false,
        "id": "rel_equipo_id",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "equipo_id",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text_cod_ref",
        "max": 0,
        "min": 0,
        "name": "codigo_referencia",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "select_estado",
        "maxSelect": 1,
        "name": "estado",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "Operativo",
          "Mantenimiento",
          "Baja"
        ]
      },
      {
        "hidden": false,
        "id": "autodate2990389176",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085495",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "id": "pbc_equipo_unid",
    "indexes": [
      "CREATE UNIQUE INDEX `idx_cod_ref_unique` ON `equipo_unidades` (`codigo_referencia`)"
    ],
    "listRule": "",
    "name": "equipo_unidades",
    "system": false,
    "type": "base",
    "updateRule": "",
    "viewRule": ""
  });

  return app.save(unidadesCollection);
}, (app) => {
  const unidadesCollection = app.findCollectionByNameOrId("pbc_equipo_unid");
  if (unidadesCollection) {
    app.delete(unidadesCollection);
  }

  const equipoCollection = app.findCollectionByNameOrId("pbc_888809168");
  if (equipoCollection) {
    equipoCollection.fields.removeById("text_desc_equipo");
    equipoCollection.fields.removeById("text_cod_base");
    app.save(equipoCollection);
  }
})
