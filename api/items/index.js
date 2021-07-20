const CosmosClient = require("@azure/cosmos").CosmosClient;



module.exports = async function (context, req) {
  const endpoint =  process.env.END_POINT_COSMOSDB;
  const key =  process.env.PRY_KEY_COSMOS;
 
   const client = new CosmosClient({ endpoint, key });
 
   const database = client.database('itnterview');
   const container = database.container("tt");

   if (req.query.count) {
     let  querySpec;
    if(req.query.count === 'all'){
    querySpec = {
      query: `SELECT COUNT(1) FROM c`// where c.type = ${req.query.count}`
    };
  } else {
    querySpec = {
      query: `SELECT COUNT(1) FROM c where c.type = '${req.query.count}'`
    };
  }
    const { resources: count } = await container.items
    .query(querySpec)
    .fetchAll();
  
    context.res = {
      body: count[0].$1,
      status: 200,
    };
      return
  }

  if (req.query.add) {
    context.bindings.dataOut = req.body
    context.res = {
      status: 200,
    };
    return
  }
      //UPDATE ITEM

if (req.query.update) {
  const {id, type} = req.query;
  await container.item(id, type).delete();
  await container.items.create(req.body);
  return
}
      //DELETE ITEM

if (req.query.delete) {
  const {id, type} = req.query;
  // const type = decodeURI(req.query.type)
  await container.item(id, type).delete();
  // await container.items.create(req.body);
  return
}
let querySpec;
if (req.query.itemstype === 'all') {
  querySpec = {
    query: `SELECT * from c ORDER BY c.index DESC OFFSET ${parseInt(req.query.offset)} LIMIT ${parseInt(req.query.lim)}`
  };
} else {
  querySpec = {
    query: `SELECT * from c WHERE c.type = '${req.query.itemstype}' ORDER BY c.index DESC OFFSET ${parseInt(req.query.offset)} LIMIT ${parseInt(req.query.lim)}`
  };
}

  
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
