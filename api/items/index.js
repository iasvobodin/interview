module.exports = async function (context, req, dataIn ) {
  if (req.query.add) {
    context.log(req)
    context.bindings.dataOut = req.body
    // dataOut = req.rawBody
    context.res = {
      status: 200,
    };
    return
  }
  if (dataIn[0]) {
    context.res = {
      body: dataIn,
      status: 200,
    };
  } else {
    context.res = {
      status: 210,
    };
  }
};
