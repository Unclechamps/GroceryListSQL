const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mustacheExpress = require('mustache-express')
const promise = require('bluebird')

// telling pg-promise that we will be using bluebird
// as the promise library
let options = {
  promiseLib : promise
}

let pgp = require('pg-promise')(options)
let connectionString = 'postgres://localhost:5432/groceryapp'
let db = pgp(connectionString)

app.use(express.static('public'))

app.engine('mustache',mustacheExpress())
app.use(bodyParser.urlencoded({extended :false}))

app.set('views','./views')
app.set('view engine','mustache')


// ADDING A LIST //
app.post('/shoppingList',function(req,res){

  let title = req.body.title

  db.none('INSERT INTO shopping_list(store_name) VALUES($1)',[title]).then(function(){
    res.redirect('/shoppingList')
  })
})

// GETTING THE /shoppintList PAGE //
app.get('/shoppingList',function(req,res){

  db.any('SELECT store_name, shopping_list_id, FROM shopping_list').then(function(data){
    res.render('shoppingList',{storeList : data})
  })

})

// DELETE A LIST //

app.post('/deleteList', function(req,res) {

  let storeID = req.body.delete

  db.any('DELETE FROM shopping_list WHERE shopping_list_id ='+storeID+'').then(function(){
    res.redirect('/shoppingList')
  })
})


// MOVE TO ADD ITEMS PAGE //

app.get('/groceryItems/:storeID',function(req,res){

  let storeID = req.params.storeID

  db.any('select sl.shopping_list_id, sl.store_name,gi.item_name,gi.price,gi.quantity, gi.grocery_item_id from shopping_list sl left join grocery_items gi on sl.shopping_list_id = gi.shopping_list_id WHERE sl.shopping_list_id = '+storeID+'').then(function(item) {
    res.render('groceryItems', {groceryList : item, store_name : item[0].store_name, shopping_list_id : item[0].shopping_list_id})

    })

  })


// ADDING ITEMS //

app.post('/individualItems',function(req,res){

  let storeID = req.body.store_id
  let item = req.body.groceryItem
  let quantity = parseInt(req.body.quantity)
  let price = parseInt(req.body.price)

  db.none('INSERT INTO grocery_items(item_name, quantity, price, shopping_list_id) VALUES($1, $2, $3, $4)',[item, quantity, price, storeID]).then(function(){
    res.redirect('/groceryItems/'+storeID+'')
  })
})

// DELETING ITEMS //

app.post('/deleteItem', function(req,res) {

  let storeID = req.body.store
  let deleteItem = req.body.deleteItem

  db.any('DELETE FROM grocery_items WHERE grocery_item_id ='+deleteItem+'').then(function(){
    res.redirect('/groceryItems/'+storeID+'')
  })
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))
