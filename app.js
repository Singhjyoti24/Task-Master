const bodyParser = require("body-parser")
const express = require("express")
const mongoose = require("mongoose")

const app = express()
app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))

mongoose.connect("mongodb://localhost:27017/todolistDB")

const itemsSchema = {
    name: String
}

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
    name: "Welcome to our todolist app"
})

const item2 = new Item({
    name: "Hit the + button to add a new item"
})

const item3 = new Item({
    name: "<--- Hit this to delete an item"
})

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
    Item.find().then((data) => {
        if (data.length === 0) {
            Item.insertMany(defaultItems);
            res.redirect("/")
        } else {
            res.render("list", { listTitle: "Today", newListItems: data });
        }
    })
})

app.post("/", function (req, res) {
    let itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }).then((foundList) => {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
})

app.post("/delete", function (req, res) {
    const id = req.body.checkbox;
    Item.deleteOne({ _id: id }).then(() => {
        res.redirect("/")
    });
})

app.get("/:customListName", function (req, res) {
    const customListName = req.params.customListName;

    List.findOne({ name: customListName }).then((foundList) => {
        if (!foundList) {
            const list = new List({
                name: customListName,
                items: defaultItems
            })

            list.save();
            res.redirect("/" + customListName)
        } else {
            res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
        }
    })
})

app.listen(3000, function () {
    console.log("Server started on port 3000!")
})