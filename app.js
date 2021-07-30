const express=require("express");
const bodyParser=require("body-parser");
const lodash=require("lodash");
// const date=require(__dirname+"/date.js");
const mongoose=require('mongoose');

const app=express();
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://admin-luckyshan:test@cluster0.8gmi4.mongodb.net/todoListDB");

const itemSchema=new mongoose.Schema({
    name:String
});

const Item = mongoose.model("Item",itemSchema);

const listSchema = {
    name: String,
    items: [itemSchema]
}

const List=mongoose.model("List",listSchema);


const item1=new Item({
    name:"Welcome to To Do List"
});

const item2=new Item({
    name:"Click + to add"
});

const item3=new Item({
    name:"Use check box to delete"
});

const defaultItems=[item1,item2,item3];



app.get("/",function(req,res){

    // let day=date.getDay();
    Item.find(function(err,items){

        if(items.length===0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("added 3 items successfully!");
                }
            })
        }

        if(err){
            console.log(err);
        }
        else{
            res.render('list',{listTitle:"Today",newListItem:items});
        }

    })


    
})

app.post("/delete",function(req,res){
    const checkedItemId=req.body.checkBox;
    const listName=req.body.listName;
    
    


    if(listName==="Today"){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(err){
                console.log(err);
            }
            else{
                console.log("deleted successfully");
            }
        } )

        res.redirect("/");
    }
    else{
        List.findOneAndUpdate(
            {name:listName},
            {$pull:{items:{_id:checkedItemId}}},
            function(err,foundList){
                if(!err){
                    res.redirect("/"+listName);
                }
            }

        )
        
    }

   

})


app.post("/",function(req,res){
    let itemName =req.body.newItem;
    let listName=req.body.list;

    // create new item document
    const newItem=new Item({
        name:itemName
    });

    if(listName==="Today"){
        newItem.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listName},function(err,foundList){
            if(err){
                console.log(err);
            }
            else{
                foundList.items.push(newItem);
                // console.log(foundList.items);
                foundList.save();
                res.redirect("/"+listName);
            }
            
        })
    }
    

})

//dynamic route
app.get("/:customListName",function(req,res){
    const customListName = lodash.capitalize(req.params.customListName);
  

    List.findOne({name:customListName},function(err,result){
        if(err){
            console.log(err);
        }
        else{
            if(!result){
                
                //create new list
                const list=new List({
                    name:customListName,
                    items: defaultItems
                });
            
                list.save();

                res.redirect("/"+customListName)
            }
            else{
                //show existing list
                res.render('list',{listTitle:customListName,newListItem:result.items});
            }
        }
    })

    

})

app.get("/about",function(req,res){
    res.render("about")

})


app.listen(Proces.env.PORT,function(){
    console.log("Server started on port 3000 successfully");
})