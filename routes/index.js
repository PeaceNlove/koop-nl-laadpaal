// Defines the routes and params name that will be passed in req.params 
// routes tell Koop what controller method should handle what request route

module.exports = {
  // route : handler
  'post /laadpaal': 'register',
  'get /laadpaal': 'index',  
  'get /laadpaal/:id': 'getData',
  'get /laadpaal/:id/FeatureServer': 'featureserver',
  'get /laadpaal/:id/FeatureServer/:layer': 'featureserver',
  'get /laadpaal/:id/FeatureServer/:layer/:method': 'featureserver',
  'post /laadpaal/:id/FeatureServer': 'featureserver',
  'post /laadpaal/:id/FeatureServer/:layer': 'featureserver',
  'post /laadpaal/:id/FeatureServer/:layer/:method': 'featureserver',
}
