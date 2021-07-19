module.exports = async function (context, req, dataIn ) {
  context.log(typeof req.query.lim)
  req.query.lim = parseInt(req.query.lim)
  context.log(typeof req.query.lim)
  if (req.query.add) {
    context.log(req)
    context.bindings.dataOut = req.body
    // dataOut = req.rawBody
    context.res = {
      status: 200,
    };
    return
  }
  // if (dataIn[0]) {
    context.res = {
      body: dataIn,
      status: 200,
  //   };
  // } else {
    // context.res = {
    //   status: 210,
    // };
  }
};
