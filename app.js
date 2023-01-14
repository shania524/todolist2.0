//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();


app.set('view engine', 'ejs');
const day = date.getDate();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://admin-shania:Shania@123@cluster0.y1xjyad.mongodb.net/?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });



mongoose.set("strictQuery", true);
mongoose.connect("mongodb+srv://admin-shania:shania123@cluster0.y1xjyad.mongodb.net/test?retryWrites=true&w=majority",{
  useNewUrlParser:true,
  //useCreateIndex : true,
  useUnifiedTopology : true,
  //useFindAndModify : false,
  //serverApi: ServerApiVersion.v1 
}).then(() => {
  console.log('connection successfull');
}).catch((err)=> console.log('no connection'));


const itemsSchema={
  name:String
}


const ListSchema={
  name:String,
  items:[itemsSchema]
}
const Item= mongoose.model("Item",itemsSchema);
const List= mongoose.model("List",ListSchema);

const item1= new Item(
  {
    name :"welcome to your todolist"
  }
);


const item2=new Item({
   name :"Hit + button to aff a new item " 
});

//  const defaultItems= [item1,item2,item3];

const item3= new Item({
  name :  "<-- Hits this to delete an item"
});

const defaultItems= [item1,item2,item3];

app.get("/", function(req, res) {

// const day = date.getDate();
   Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems , function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Successfully saved default items to DB.");
        }
        res.redirect("/");
      })
    }else{
    res.render("list", {listTitle: day, newListItems: foundItems});
    }
   });
  // res.render("list", {listTitle: day, newListItems: items});
});

app.get("/:customListName", function(req,res){
  const customListName= _.capitalize(req.params.customListName);

  List.findOne({name :customListName},function(err,foundList){
    if(!err){
     if(!foundList){ 
      const list= new List
      ({
         name : customListName,
         items : defaultItems
       });
   
       list.save();
       res.redirect("/" + customListName );
    }
     else {
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
     }
      
    }
  });
 
  
 });


app.post("/", function(req, res){

  const itemName= req.body.newItem;
  const listName= req.body.list;
  const item=new Item({
    name : itemName
 });
 if(listName === day){
  item.save();
  res.redirect("/");
 }
 else{
    List.findOne({name:listName},function(err,foundList){
      
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+  listName );
      
    })
 }
});

app.post("/delete",function(req,res){
  const checkboxid=req.body.checkbox;
  const listName= req.body.listName;
  if(listName === day) {
    Item.findByIdAndDelete(checkboxid,function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("successfully deleted");
        res.redirect("/");
      }
    })
  }
 else{
  List.findOneAndUpdate({name :listName},{$pull:{items:{_id:checkboxid}}},function(err,foundList){
    if(!err){
      res.redirect("/"+ listName);
    }
  })
 }
})

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen( process.env.PORT||3000 , function() {
  console.log("Server started on port 3000");
});
