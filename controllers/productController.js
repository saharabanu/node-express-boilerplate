let products = [
    {id:1, name:"Watch"},
    {id:2, name:"Laptop"},
    {id:3, name:"dress"},
    {id:4, name:"Sunglass"},
]

//  get all product controller 

module.exports.getAllProducts =(req,res,next) => {
    const {limit,page} = req.query
    // const {ip,query,params, body,headers} = req;
    // console.log(limit,page);
   
    res.status(200).json({
        success:true,
        messages:"success",
        data:products.slice(0,5)
    })
    res.status(500).json({
        success:false,
        error:"Something Went wrong",
    })
}

//  get  product by id controller 

module.exports.getProductDetails =(req,res,next) => {
    const {id} = req.params;
    const foundProduct = products.find(product=>product.id === Number(id))

    // console.log(id);
    
   
    res.status(200).send(foundProduct)
}

//  Post or create a product controller 

module.exports.CreateProduct =(req,res) => {

    products.push(req.body)
    res.status(200).send(products)
}

//  update  product controller 

module.exports.UpdateProduct =(req,res) => {
   const {id} = req.params;
   const filter= {_id:id};
   const newData= products.find(product=> product.id === Number(id));
   newData.id= id;
   newData.name= req.body.name;
   res.status(200).send(newData)
}
//  delete  product controller 

module.exports.DeleteProduct =(req,res) => {
   const {id} = req.params;
   const filter= {_id:id};
  products= products.filter(product=> product.id !== Number(id));
  res.status(200).send(products)
}



 