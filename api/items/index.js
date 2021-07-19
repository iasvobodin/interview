const CosmosClient = require("@azure/cosmos").CosmosClient;



module.exports = async function (context, req) {
  const endpoint =  process.env.END_POINT_COSMOSDB;
  const key =  process.env.PRY_KEY_COSMOS;
 
   const client = new CosmosClient({ endpoint, key });
 
   const database = client.database('itnterview');
   const container = database.container("tt");
   
  if (req.query.add) {
    // context.log(req)
    context.bindings.dataOut = req.body
    // dataOut = req.rawBody
    context.res = {
      status: 200,
    };
    return
  }
      //UPDATE ITEM

if (req.query.update) {
  const { id, type } = req.query;

const { resource: updatedItem } = await container
  .item(id, type)
  .replace(req.body);
return
}


  const querySpec = {
    query: `SELECT * from c  ORDER BY c.index DESC OFFSET ${parseInt(req.query.offset)} LIMIT ${parseInt(req.query.lim)}`
  };
  
  // read all items in the Items container
  const { resources: items } = await container.items
    .query(querySpec)
    .fetchAll();
  
    context.res = {
      body: items,
      status: 200,
    };


    //UPDATE ITEM

// if (req.query.update) {
//   const { id, type } = req.query;

// const { resource: updatedItem } = await container
//   .item(id, type)
//   .replace(req.body);

// }

    
// if (req.query.add) {
//   const { id, type } = req.query;

// const { resource: updatedItem } = await container
//   .item(id, type)
//   .replace(req.body);

// }









  // context.log(typeof req.query.lim)
  // req.query.lim = parseInt(req.query.lim)
  // context.log(typeof req.query.lim)

  // // if (dataIn[0]) {
  //   context.res = {
  //     body: dataIn,
  //     status: 200,
  // //   };
  // // } else {
  //   // context.res = {
  //   //   status: 210,
  //   // };
  // }
};
