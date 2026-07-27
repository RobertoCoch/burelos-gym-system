/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_888809168")

  // add cantidad_total
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "number_cantidad_total",
    "max": null,
    "min": 0,
    "name": "cantidad_total",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add cantidad_mantenimiento
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "number_cantidad_mant",
    "max": null,
    "min": 0,
    "name": "cantidad_mantenimiento",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add tipo
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "select_tipo",
    "maxSelect": 1,
    "name": "tipo",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "Peso Libre",
      "Máquina Guiada",
      "Poleas",
      "Cardio",
      "Funcional"
    ]
  }))

  // add musculo_objetivo
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "select_musculo",
    "maxSelect": 1,
    "name": "musculo_objetivo",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "Pecho",
      "Espalda",
      "Pierna",
      "Brazo",
      "Hombro",
      "Full Body"
    ]
  }))

  // remove estado
  collection.fields.removeById("select643686883")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_888809168")

  collection.fields.removeById("number_cantidad_total")
  collection.fields.removeById("number_cantidad_mant")
  collection.fields.removeById("select_tipo")
  collection.fields.removeById("select_musculo")

  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "select643686883",
    "maxSelect": 1,
    "name": "estado",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "optimo",
      "mantenimiento"
    ]
  }))

  return app.save(collection)
})
