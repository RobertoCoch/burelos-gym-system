/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")
  
  // Establecer manageRule permite a los administradores administrar por completo 
  // los registros de autenticación de otros usuarios.
  // Esto expone el campo "email" (incluso si emailVisibility es false) y
  // permite actualizar la contraseña sin ser un Superusuario absoluto.
  collection.manageRule = "@request.auth.role = 'admin'"

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")
  
  collection.manageRule = null

  return app.save(collection)
})
