---
layout: post
title: "Building a Modern Web Application with Django REST Framework and Vue:  Building Views and REST API"
description: "In this tutorial, the third part of building a demo application with Django and Django REST framework for the API back-end and a Vue front-end will be covered. You'll first build the REST API with Django REST Framework then build the views to consume the API and finally see some tips for the production setup"
date: "2018-03-1 10:32"
author:
  name: "Ahmed Bouchefra"
  url: "https://www.techiediaries.com"
  mail: "techiediaries9@gmail.com"
  avatar: "https://twitter.com/ahmedbouchefra/profile_image?size=original"
---


Throughout this part of these tutorial series you will continue  developing a CRUD (Create, Read, Update and Delete) application with a restful API back-end and a Vue front-end using Django, Django REST framework and Vue (with Axios as an HTTP client). In this part you'll specifically build the REST API and the front-end views to consume and display data from the API endpoints. You will also see how to  integrate your Vue application with your Django back-end in production. As always you can find the source code of the demo project in this [Github repository](https://github.com/techiediaries/django-auth0-vue).
   
## Summary


This article is composed of the following sections:

* Building the REST API: You will create a simple REST API around one model (*Product*) with DRF and learn how to add pagination to your APIs. 
* Creating the Service to Consume the API: You will create the class that interfaces with your API using Axios.   
* Creating the Front End Views: You will create different  views and routes for the Vue application and  see how you can protect some routes from non authenticated users. 
* Getting Ready for Production: Finally you'll prepare your app for production by tweaking some settings in Vue and Django parts. 


## Building the REST API

Django REST framework is a powerful and easy to use package for building Web APIs.

Let's get started by building a simple REST API using Django REST framework. 

### Adding the Product Model

Django has a powerful ORM (Object Relational Mapper) that allows you to work with multiple database management systems without actually writing any SQL. All you need to do is to define models in Python classes and Django will take care of mapping Python classes to SQL queries. 

The API is built around a simple product model so continuing with the project you've built in the previous part open the `catalog/models.py` file then add the following model 

```python
from django.db import models

class Product(models.Model):

    sku = models.CharField(max_length=13,help_text="Enter Stock Keeping Unit")    
    name = models.CharField(max_length=200, help_text="Enter product name")
    description = models.TextField(help_text="Enter product description")
    
    buyPrice = models.DecimalField(decimal_places=2, max_digits=20,help_text="Enter product price per unit")
    sellPrice = models.DecimalField(decimal_places=2, max_digits=20,help_text="Enter product price per unit")
    
    unit = models.CharField(max_length=10,help_text="Enter product unit")
    
    quantity = models.DecimalField(decimal_places=1, max_digits=20,help_text="Enter quantity")

    def get_absolute_url(self):
         """
         Returns the url to access a particular instance of Product.
         """
         return reverse('product-detail-view', args=[str(self.id)])
    
    def __str__(self):
        
        return self.sku
```

This is a Python class that extends the special Django class *Model* which is imported from the `django.db.models` built-in package. Every Django model needs to extends the *Model* class. You then specify the model fields using classes like *CharField*, *TextField* and *DecimalField* etc.

Now you need to migrate your database to add the new changes

```bash
python manage.py makemigrations
python manage.py migrate
```     

Next let's add some seed data using a data migration

So first make an empty migration by running the following command:

```bash
python manage.py makemigrations catalog --empty
```

Next open your migration file in your app migrations folder (`catalog/migrations`) then create a function that will executed by the `RunPython()` method when you apply your migration

```python
from django.db import migrations
from django.conf import settings

def create_data(apps, schema_editor):
    Product = apps.get_model('catalog', 'Product')
    Product(sku='sku1',name='Product 1', description='Product 1', buyPrice=100 , sellPrice=100,unit='kilogram', quantity=100).save()
    ##...

class Migration(migrations.Migration):
    dependencies = [
        ('catalog', '0001_initial'),
    ]
    operations = [
        migrations.RunPython(create_data),
    ]
```

You can then migrate your database to create the initial data

```python
python manage.py migrate
```

### Adding the Serializer Class

From [Django REST framework docs](http://www.django-rest-framework.org/api-guide/serializers/) here is the definition of a serializer

>Serializers allow complex data such as querysets and model instances to be converted to native Python datatypes that can then be easily rendered into JSON, XML or other content types. Serializers also provide deserialization, allowing parsed data to be converted back into complex types, after first validating the incoming data.

Create a `serializers.py` file inside your the *catalog* app folder then add the following code to create a serializer class for the product model

```python
from rest_framework import serializers
from .models import Product
class ProductSerializer(serializers.ModelSerializer):

    class Meta:
        model = Product 
        fields = ('pk','sku', 'name', 'description', 'buyPrice','sellPrice','unit','quantity')
```


### Adding the API Views

After adding the database model and the serializer class and also some seed data the next thing is to create the API views that will be responsible for creating, updating, deleting and fetching data from the database and send it back to users as JSON database when users request the appropriate API endpoint so go ahead and open the `catalog/views.py` file then start by adding the following imports 

```python
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from .models import Product 
from .serializers import * 
```

This code imports different classes from DRF package, paginator classes to add pagination and then the Product model and its serializer class.



### Adding the Product List/Create API View

In your `catalog/views.py` add the following view function which can process either GET or POST requests to either return paginated list of products or create a product. 
 
```python
@api_view(['GET', 'POST'])
def product_list(request):
    """
    List  products, or create a new product.
    """
    if request.method == 'GET':
        data = []
        nextPage = 1
        previousPage = 1
        products = Product.objects.all()
        page = request.GET.get('page', 1)
        paginator = Paginator(products, 10)
        try:
            data = paginator.page(page)
        except PageNotAnInteger:
            data = paginator.page(1)
        except EmptyPage:
            data = paginator.page(paginator.num_pages)

        serializer = ProductSerializer(data,context={'request': request} ,many=True)
        if data.has_next():
            nextPage = data.next_page_number()
        if data.has_previous():
            previousPage = data.previous_page_number()
        
        return Response({'data': serializer.data , 'count': paginator.count, 'numpages' : paginator.num_pages, 'nextlink': '/api/products/?page=' + str(nextPage), 'prevlink': '/api/products/?page=' + str(previousPage)})

    elif request.method == 'POST':
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

This function first checks if it's a GET or POST request then preforms the processing based on the type of the request:

* If it's a GET request, the function retrieves the page number from the GET request or use the first page by default if no page is submitted  then retrieves the request page of products, serialize it and return it back alongside with other information such as the next page and previous page links.
* If it's a POST request, the function creates the product based on the POST data. 
 
### Adding the Product Detail API View

Now you need to add the view function that will be responsible for getting, updating or deleting a single product by *id* depending on the type of the HTTP request (GET, PUT or DELETE).
 
```python
@api_view(['GET', 'PUT', 'DELETE'])
def product_detail(request, pk):
    """
    Retrieve, update or delete a product instance.
    """
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ProductSerializer(product,context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = ProductSerializer(product, data=request.data,context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

```

This view method first checks if a product, with the primary key passed as a parameter, exists. If it does exist it returns   a 404 response otherwise it checks for the request method:

* If it's a GET the product is simply returned
* If it's a PUT the product is updated
* If it's a DELETE the product is deleted 

### Adding API Endpoints

Next you need to create the two API endpoints `api/products/` for querying and creating products and `api/products/<id>` for displaying single product information, updating and deleting single products by their *id*.

Go ahead and open `catalog/urls.py` then add 

```py
##...
from catalog import views
##...

urlpatterns = [
    ##...
    url(r'^api/products/$', views.product_list),
    url(r'^api/products/(?P<pk>[0-9]+)$', views.product_detail),
    ##...

]
```

## Creating the Service to Consume the API

Now that you have created the API you need to consume it from your app front-end built with Vue. You'll use the Axios HTTP client to make HTTP calls to the API.

For the sake of organizing the code you'll encapsulate all the code that communicates with the API in one single class that will be used from different views to make any calls to the API endpoints.
    
So inside `vueapp/src` create an *http* folder (or call it whatever you want) then create the `APIService.js` class 

This class provides wrapper methods for the Axios get, post, put and delete methods. In each method the endpoint URL is constructed and an Authorization header is built with the format `Bearer <TOKEN>`. The token is retrieved from *localhost* using the static method  *getAuthToken()* of  *AuthService*.

The `APIService.js` class contains these methods 
 
* getProducts(): you'll use this method to retrieve paginated list of products 
* getProduct(pk): you'll use this method to retrieve a product by id/primary key
* createProduct(product): you'll use this method to create a product
* updateProduct(product): you'll use this method to update a product
* deleteProduct(product): you'll use this method to delete a product

In `APIService.js`  copy the following code

```js
import axios from 'axios';
import AuthService from '../auth/AuthService';
const API_URL = 'http://localhost:8000';

export class APIService{
    constructor(){
      
    }
    
    /* The other methods go here */
}
```

This code imports *axios* and *AuthService* class then declares  an *API_URL* constant pointing to the URL of the local Django server and finally declares and exports the *APIService* which contains different methods to interact with the Django API. 

Let's now see the implementations of different methods of the *APIService*

### Getting Products 

Let's start with the `getProducts()` to query the API endpoint for available products. Copy the following code to your `APIService.js` file:
 
```js
    getProducts() {
        const url = `${API_URL}/api/products/`;
        return axios.get(url, { headers: { Authorization: `Bearer ${AuthService.getAuthToken()}` }}).then(response => response.data);
    }

```

The *getProducts()* method sends a GET request to  the `/api/products/` endpoint using `axios.get()` method with the Auth0 authorization header retrieved from the local storage.

### Getting a Product by Id

Let's now see the implementation of the `getProduct(pk)` method for retrieving single products.
 
```js
    getProduct(pk) {
        const url = `${API_URL}/api/products/${pk}`;
        return axios.get(url, { headers: { Authorization: `Bearer ${AuthService.getAuthToken()}` }}).then(response => response.data);
    }  
```

The `getProduct(pk)` method sends an authorized GET request to `/api/products/<pk>` endpoint for retrieving a single product by its *id* or primary key.

### Getting Products by URL

The API you created returns links to access the previous and next pages of data so you need to add this method which retrieves the products for a specified page by its URL.
 
```js
    getProductsByURL(link){
        const url = `${API_URL}${link}`;
        return axios.get(url, { headers: { Authorization: `Bearer ${AuthService.getAuthToken()}` }}).then(response => response.data);
        
    }
```


### Deleting a Product 

Let's now add the function which handles calling the endpoint for deleting a single product

```js
    deleteProduct(product){
        const url = `${API_URL}/api/products/${product.pk}`;
        return axios.delete(url, { headers: { Authorization: `Bearer ${AuthService.getAuthToken()}` }});

    }
```

The `deleteProduct(product)` sends a DELETE request to the `/api/products/<pk>` endpoint using the `axios.delete()` method.

### Creating a Product 

Next, let's add the method to create a product 

```js
    createProduct(product){
        const url = `${API_URL}/api/products/`;
        const headers = {Authorization: `Bearer ${AuthService.getAuthToken()}`};
        return axios.post(url,product,{headers: headers});
    }
```

The `createProduct(product)` function sends a POST request to the `/api/products/` endpoint with an authorization token retrieved from the local storage using the `axios.post()` method.

### Updating a Product

The last method is used for updating products

```js
    updateProduct(product){
        const url = `${API_URL}/api/products/${product.pk}`;
        const headers = {Authorization: `Bearer ${AuthService.getAuthToken()}`};
        return axios.put(url,product,{headers: headers});
    }    
} 
```  

The  `updateProduct(product)` sends a PUT request to the `/api/products/<pk>` endpoint with an authorization header using the `axios.put()` method.


## Creating the Front End Views

Now it's time to create the front end views to display, create, update and delete products 

The demo app you are going to build has the following views:

* `App.vue`: this is the main view which includes the common header of all pages and the router view in which the other components are inserted by the Vue router
* `Home.vue`: this is the home view with some information about the project
* `ProductList.vue`: this page displays a paginated list of products with links to the other pages
* `ProductCreate.vue`: this is the product create view for creating and also updating products
* `Callback.vue`: this is the callback view that will be called when Auth0 authentication is successful to handle the authentication and saves the auth token in the local storage.


### Building the App View

Let's start by adding the `App.vue` template. The generated Vue project already contains an `App.vue` file so simply update it to reflect the following template

```html
<template>
<div>
    <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
      <a class="navbar-brand" href="#">Django - Auth0 - Vue</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarCollapse">
        <ul class="navbar-nav mr-auto">

          <li class="nav-item">
          <a class="btn btn-primary" href="/">Home</a>
          </li>
          <li class="nav-item">
          <a class="btn btn-primary" href="/product-list">Products</a>
          </li>
          <li class="nav-item">
          <a class="btn btn-primary" href="/product-create">Create</a>
          </li>
          
        </ul>
          <button
            class="btn btn-primary btn-margin"
            v-if="!authenticated"
            @click="login()">
              Log In
          </button>

          <button
            class="btn btn-primary btn-margin"
            v-if="authenticated"
            @click="logout()">
              Log Out
          </button>

      </div>
    </nav>

    <div class="container">
      <router-view 
        :auth="auth" 
        :authenticated="authenticated">
      </router-view>
    </div>

</div>  
</template>
```

This code a header styled with Bootstrap that contains links to different pages and button to login and logout then a `<router-view>` component which  renders the matched component for the given path. See the docs for [**router-view**](https://router.vuejs.org/en/api/router-view.html).

You can notice that two variables (*auth* an instance of *AuthService* and *authenticated* a boolean variable that holds the state of the authentication) are bound to the router view component that will be passed to the other components.

The `v-if` directive is used to display the *log in* and *log out* buttons depending on the *authenticated* variable.



Next you need to add the JavaScript code for the `App.vue` component

```javascript
<script>
import AuthService from './auth/AuthService'

const auth = new AuthService()

const { login, logout, authenticated, authNotifier } = auth

export default {
  name: 'app',
  data () {
    authNotifier.on('authChange', authState => {
      this.authenticated = authState.authenticated
    })
    return {
      auth,
      authenticated
    }
  },
  methods: {
    login,
    logout
  }
}
</script>
```

In nutshell this code imports the *AuthService* and create an instance of it then adds the login and logout methods of the instance to the *methods* array so they become accessible in the template where you can bind them to the login and logout buttons. 

Also this code watches the authentication state using the *authNotifier* object and sets the *authenticated* variable accordingly. 

The *authenticated* and *auth* variables are returned from the *data()* method to become accessible from the template. 

Also make sure to include Bootstrap 4 using  the CSS *@import* 

So download [bootstrap 4](https://getbootstrap.com/docs/4.0/getting-started/download/) and unzip it in the `assets` folder then add a <style> block with the following content

```css
<style>
@import './assets/bootstrap.min.css';
body {
  min-height: 75rem;
  padding-top: 4.5rem;
}
.nav-item{
  padding:1px;
  margin-left: 5px;
}
</style>
```

This is a screen shot of the header you should get 

![](https://screenshotscdn.firefoxusercontent.com/images/7f7d7222-80ab-471d-af3f-16a675c23149.png)
 
### Adding the Home View

Next let's add the home view. Navigate inside the *components* folder then create and open the `Home.vue` file.

First copy the following template 

```html
<template>
    <main role="main">
      <div class="jumbotron">
        <h1>Django - Auth0 - Vue</h1>
        <p class="lead">This demo application uses Django and Django REST Framework for backend, Vue for the frontend and Auth0 for handling user's authentication</p>
        <a class="btn btn-lg btn-primary" href="" role="button">View tutorial</a>
      </div>

    <h4 v-if="!authenticated">
      You are not logged in! Please <a class="btn btn-primary" @click="auth.login()">Log In</a> to continue.
    </h4>
    </main>
</template>    
``` 

If the user is not authenticated he will get the message *You are not logged in! Please Login In* with a button to be able to login (bound to the *auth.login()* method). 

Aside from that this component displays a Bootstrap jumbotron  with some information about the demo.

Next add the following JavaScript code in the same file

```javascript
<script>
  export default {
    name: 'home',
    props: ['auth', 'authenticated'],
 }
</script>
```

This component declares two props *auth* and *authenticated* which you have passed earlier from the parent component:  `<router-view :auth="auth" :authenticated="authenticated">`.

This is what you should get at this point 

![](https://screenshotscdn.firefoxusercontent.com/images/12f97cfb-4c99-4d1a-b32d-59eada3dfa1f.png)

After logging using Auth0 you'll get this

![](https://screenshotscdn.firefoxusercontent.com/images/7cbf972c-d65f-450b-83fb-99dfb151e8e2.png)
### Adding the Product List View

Now let's create the view to display the paginated list of products fetched from the API endpoint. Go ahead and create the `ProductList.vue` file inside the `components` folder then open it.

Next copy the following code for the template part

```html
<template>
<div>
<h1>Products ({{numberOfProducts}})</h1>
<table class="table table-bordered table-hover">
  <thead>
    <tr>
      <th>#</th>
      <th>SKU</th>
      <th>Name</th>
      <th>Quantity</th>
      <th>Price</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr   v-for="product in products" @click="selectProduct(product)">
      <th>{{product.pk}}</th>
      <th>{{product.sku}}</th>
      <td>{{product.name}}</td>
      <td>{{product.quantity}} {{product.unit}}</td>
      <td>{{product.sellPrice | currency}}</td>
      <td>
        <button class="btn btn-danger" @click="deleteProduct(product)"> X</button>
        <a class="btn btn-primary" v-bind:href="'/product-update/' + product.pk"> &#9998; </a>
      
      </td>
    </tr>
  </tbody>
</table>
<div>
<ul class="list-horizontal">
  <li><button class="btn btn-primary" @click="getPreviousPage()">Previous</button></li>
  <li v-for="page in pages">
    <a class="btn btn-primary" @click="getPage(page.link)">{{ page.pageNumber }}</a>
  </li>
  <li><button class="btn btn-primary" @click="getNextPage()">Next</button></li>
</ul>


</div>

<div class="card text-center" v-if="selectedProduct">
  <div class="card-header">
    #{{selectedProduct.pk}} -- {{selectedProduct.sku}}
  </div>
  <div class="card-block">
    <h4 class="card-title">{{selectedProduct.name}}</h4>
    <p class="card-text">
    {{selectedProduct.description}}
    </p>
    <a class="btn btn-primary" v-bind:href="'/product-update/' + selectedProduct.pk"> &#9998; </a>
    <button class="btn btn-danger" @click="deleteProduct(selectedProduct)"> X</button>

  </div>

</div>
</div>
</template>
```   
 
 This template displays the table of products and details about a selected product below the table.

Next you need to define different methods and variables used in this template  so in the same file add the following code

```javascript
<script>
import {APIService} from '../http/APIService';
import Loading from './Loading';
const API_URL = 'http://localhost:8000';
const apiService = new APIService();

export default {
  name: 'ProductList',
  data() {
    return {
      selectedProduct:null,
      products: [],
      numberOfPages:0,
      pages : [],
      numberOfProducts:0,
      loading: false,
      nextPageURL:'',
      previousPageURL:''
    };
  }, 
  methods: {
    getProducts(){

      this.loading = true;    
      apiService.getProducts().then((page) => {
        this.products = page.data;
        console.log(page);
        console.log(page.nextlink);
        this.numberOfProducts = page.count;
        this.numberOfPages = page.numpages;
        this.nextPageURL = page.nextlink;
        this.previousPageURL = page.prevlink;
        if(this.numberOfPages)
        {
          for(var i = 1 ; i <= this.numberOfPages ; i++)
          {
            const link = `/api/products/?page=${i}`;
            this.pages.push({pageNumber: i , link: link})
          }
        }
        this.loading = false;
      });
    },
    getPage(link){
      this.loading = true;  
      apiService.getProductsByURL(link).then((page) => {
        this.products = page.data;
        this.nextPageURL = page.nextlink;
        this.previousPageURL = page.prevlink;
        this.loading = false;
      });     
    },
    getNextPage(){
      console.log('next' + this.nextPageURL);
      this.loading = true;  
      apiService.getProductsByURL(this.nextPageURL).then((page) => {
        this.products = page.data;
        this.nextPageURL = page.nextlink;
        this.previousPageURL = page.prevlink;
        this.loading = false;
      });      
      
    },
    getPreviousPage(){
      this.loading = true;  
      apiService.getProductsByURL(this.previousPageURL).then((page) => {
        this.products = page.data;
        this.nextPageURL = page.nextlink;
        this.previousPageURL = page.prevlink;
        this.loading = false;
      });      
            
    },
    deleteProduct(product){
      console.log("deleting product: " + JSON.stringify(product))
      apiService.deleteProduct(product).then((r)=>{
        console.log(r);
        if(r.status === 204)
        {
          alert("Product deleted");
          this.$router.go()
          
        }
      })
    },
    selectProduct(product){
      this.selectedProduct = product;
    }
  },
  mounted() {
   
    this.getProducts();

  },
}
</script>
```

In nutshell this code creates an instance of the *APIService* class then wraps different methods to get and delete products and also to get previous and next pages of data.

This is a screen shot of what you should get 

![](https://camo.githubusercontent.com/108cac1baf92e9ea68ec1326fd2cb2292266a718/68747470733a2f2f73637265656e73686f74732e66697265666f7875736572636f6e74656e742e636f6d2f696d616765732f36323663303262302d616363622d343561362d623430622d6565633465613331333337342e706e67)
 
### Adding the Product Create/Update View

This view is used to create and also update products by id so create a `ProductCreate.vue` file then open it and add the following template 

```html
<template>

        <div id="container" class="container">
      
            <div class="row">
            
                <div class="col-sm-8 offset-sm-2">
                <div class="alert alert-warning" v-show="showCreateMessage"  >
                  <button type="button" class="close" @click="hideMessage()">X</button>
                  <strong>Product successfully created!</strong>
                </div>
                <div class="alert alert-warning" v-show="showUpdateMessage"  >
                  <button type="button" class="close" @click="hideMessage()">X</button>
                  <strong>Product successfully updated!</strong>
                </div>
                
                <div class="alert alert-warning" v-show="showError"  >
                  <button type="button" class="close" @click="hideMessage()">X</button>
                  <strong>Error!</strong>
                </div>                
                    <h1>Create a Product</h1>
                    <div class="info-form">
                      <form>
                        <div class="form-group">
                          <label for="sku">Product SKU</label>
                          <input v-model="product.sku" type="text" class="form-control" id="sku" aria-describedby="skuHelp" placeholder="Enter SKU">
                          <small id="skuHelp" class="form-text text-muted">Enter your product's SKU</small>
                          <label for="name">Product Name</label>
                          <input v-model="product.name" type="text" class="form-control" id="name" aria-describedby="nameHelp" placeholder="Enter name">
                          <small id="nameHelp" class="form-text text-muted">Enter your product's name</small>

                          <label for="description">Product Description</label>
                          <textarea v-model="product.description" class="form-control" id="description" aria-describedby="descHelp" placeholder="Enter description"></textarea>
                          <small id="descHelp" class="form-text text-muted">Enter your product's description</small>

                          <label for="buyPrice">Product Cost</label>
                          <input v-model="product.buyPrice" type="text" class="form-control" id="buyPrice" aria-describedby="buyPriceHelp" placeholder="Enter the buying price">
                          <small id="buyPriceHelp" class="form-text text-muted">Enter your product's cost</small>

                          <label for="sellPrice">Product Price</label>
                          <input v-model="product.sellPrice" type="text" class="form-control" id="sellPrice" aria-describedby="sellPriceHelp" placeholder="Enter name">
                          <small id="sellPriceHelp" class="form-text text-muted">Enter your product's selling price</small>

                          <label for="unit">Product Unit</label>
                          <input v-model="product.unit" type="text" class="form-control" id="unit" aria-describedby="unitHelp" placeholder="Enter unit">
                          <small id="unitHelp" class="form-text text-muted">Enter your product's unit</small>

                          <label for="quantity">Product Quantity</label>
                          <input v-model="product.quantity" type="text" class="form-control" id="quantity" aria-describedby="quantityHelp" placeholder="Enter quantity">
                          <small id="quantityHelp" class="form-text text-muted">Enter your product's quantity</small>

                        </div>
                      </form>
                       <button class="btn btn-primary" v-if="!this.product.pk" @click="createProduct()" ><span v-if="!creating">Create</span><span v-if="creating">Creating... Please wait </span></button>
                       <button class="btn btn-primary" v-if="this.product.pk" @click="updateProduct()" ><span v-if="!updating">Update</span><span v-if="updating">Updating... Please wait </span></button>
                       <button class="btn btn-primary"  @click="newProduct()" >New..</button>

                    </div>
                </div>
            </div>
        </div>

</template>
``` 

Next you need to add this code in the same file:

```javascript
<script>
import {APIService} from '../http/APIService';

const apiService = new APIService();

export default {
  name: 'ProductCreate',
  components: {
  },
  data() {
    return {
      showCreateMessage: false,
      showUpdateMessage: false,
      showError: false,
      product: {},
      products: '',
      creating: false,
      updating: false
    };
  }, 
  methods: {
    hideMessage(){
      this.showCreateMessage = false;
      this.showUpdateMessage = false;
      this.showError = false;
    },
    createProduct(){
      this.creating = true;
      apiService.createProduct(this.product).then((result)=>{
          if(result.status === 201){
            this.product = result.data;
            this.showCreateMessage = true;
          }
          this.creating = false;          
      },(error)=>{
        this.showError = true;
        this.creating = false;
      });
    },
    updateProduct(){
      this.updating = true;
     apiService.updateProduct(this.product).then((result)=>{
          if(result.status === 200){
            this.showUpdateMessage = true;
          }
          
      },(error)=>{
        this.showError = true;
        this.updating = false;
      });
    },
    newProduct(){
      this.product = {};
    }
    
  },
  mounted() {
    
    if(this.$route.params.pk){
	    apiService.getProduct(this.$route.params.pk).then((product)=>{
        this.product = product;
      })
    }
  },
}
</script>
```

This is a screen shot of what you should get 
![](https://camo.githubusercontent.com/7085b3824c7ab564a09e761f0e5cf58f05123f25/68747470733a2f2f73637265656e73686f74732e66697265666f7875736572636f6e74656e742e636f6d2f696d616765732f37386131393135322d306565302d346462632d383636622d3930393864346533626534342e706e67)

### Adding the Callback View

In the previous parts you used the App.vue as the callback view for Auth0 now let's make a callback view which has the only task of processing the Auth0 response when the users authenticates via Auth0. Go ahead and create a `Callback.vue` component inside the `components` folder, next open it and add the following template 

```html
<template>
  <div class="spinner">
    <img src="../assets/loading.svg" alt="loading..."/>
  </div>
</template>
```
 If you put a `loading.svg` image inside your `assets` folder otherwise the *loading...* message will be shown.

Next add the following JavaScript code inside the same file

```javascript
<script>
  export default {
    name: 'callback',
    props: ['auth'],
    data () {
      this.auth.handleAuthentication()
      return {}
    }
  }
</script>
```  

So this component declares an *auth* prop which will be passed from the router view then in the *data()* method calls the the *handleAuthentication()* method of *auth* (instance of *AuthService*) to process the callback result passed from Auth0 and stores the authentication token in the local storage. 

Just like you did in the previous part you need to change your callback URL in Auth0 dashboard to point to http://localhost:8000/callback

![](https://screenshotscdn.firefoxusercontent.com/images/f72df4ef-f4e2-4961-88bf-5e0474840dd1.png)

 
### Adding Routing with The Vue Router

After creating the necessary components let's add routing to the application. Go ahead and open the `src/router/index.js` file then add the following routes

```js
/* other imports */
import ProductList from '@/components/ProductList'
import ProductCreate from '@/components/ProductCreate'
import Callback from '@/components/Callback'
import Home from '@/components/Home'
/* other imports */

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/product-list',
    name: 'ProductList',
    component: ProductList
  },
  {
    path: '/product-create',
    name: 'ProductCreate',
    component: ProductCreate
  },
  {
    path: '/product-update/:pk',
    name: 'ProductUpdate',
    component: ProductCreate
  },
  {
    path: '/callback',
    name: 'Callback',
    component: Callback
  }]
const router = new Router({
  mode: 'history',
  routes
})  
``` 

In modern browsers you can use HTML5 History API for routing client side applications without using URL hashes. The Vue router supports this mode by adding `mode: 'history'`. 

The router `index.js` file imports all the components that you want to use for your application and exports an array of routes. Each route is a JavaScript object may have some or all of these properties: the route name, the path, a meta object and the component to navigate to when the path is matched.   

### Adding the Authentication Guard

Certain routes need to be protected from users which don't have passed Auth0 authentication.

The Vue router provides a way to add [meta data to each route](https://router.vuejs.org/en/advanced/meta.html) where you can any meta data to be used for some task. In this example you'll add a meta field to mark the route as requiring authentication.

```js
  {
    path: '/product-list',
    name: 'ProductList',
    component: ProductList,
    meta: { requiresAuth : true }
  },
  {
    path: '/product-create',
    name: 'ProductCreate',
    component: ProductCreate,
    meta: { requiresAuth : true }    
  },
```

After adding the *requiresAuth* meta tag you need to use [navigation guards]( https://router.vuejs.org/en/advanced/navigation-guards.html )  to check if the user is allowed to access a particular route i.e if he's authenticated . So you need to add the global guard  *router.beforeEach()* 

```javascript
router.beforeEach((to, from, next) => {
  if(to.meta.requiresAuth)
  {
    if(!AuthService.authenticated())
    {
      next('/');
    }
  }
  next()
})
```

Before navigating to each route this code checks if the route has a *requiresAuth* meta field then use the *AuthService.authenticated()* method to check if the user is authenticated and redirects to */* if it's not the case. 


## Getting Ready for Production

In the previous part you have seen how you can integrate Django and Vue in development phase where you can have two development servers (Django and Vue). In this section you will learn how integrate Django with Vue in production.

 
So in `vueapp/build/webpack.prod.conf.js` import `webpack-bundle-tracker`

```js
const BundleTracker = require('webpack-bundle-tracker')
```
 
 Then add *BundleTracker* to plugins
 
 ```js
   plugins: [
    //...
    new BundleTracker({filename: '../webpack-stats-prod.json'})
    
 ```

This tells *BundleTracker* to generate `webpack-stats-prod.json` in the root folder.
 
In `vueapp/config/index.js` change *static* to *assets* (because commonly Django uses the `/static/` URL for serving static files so you don't want to have URLs with `/static/static/` paths). You also need to set the assets public path to `/static/` so Webpack can generate URLs because Django serves static files over the `/static/` URL. 

```
build: {
    // Template for index.html
    index: path.resolve(__dirname, '../dist/index.html'),

    // Paths
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'assets', 
    assetsPublicPath: '/static/',

```

Run the following command for generating the build files

```bash
npm run build
```

You will get a `vueapp/dist` folder that contains the build files. 


![](https://screenshotscdn.firefoxusercontent.com/images/0db7c355-8e4a-4ec6-bd30-d5899d402e6e.png)


Next in `settings.py` add

```python
STATICFILES_DIRS = (
    os.path.join(BASE_DIR, 'vueapp/dist'),
)

STATIC_ROOT = os.path.join(BASE_DIR, 'public')
```

*STATICFILES_DIRS* contains folders where Django can find static files. These folders will be later copied to where *STATIC_ROOT* points after collecting the static files using the *collectstatic* command

So go ahead and run this command to collect all static files in the project and put them in the *public* folder

```bash
python manage.py collectstatic
```

A public folder will be created and all static files will be copied there.


![](https://screenshotscdn.firefoxusercontent.com/images/435cf077-dc81-445b-8e87-787b851fafca.png)

In production Webpack will produce many chunks of your bundle for performance reasons so you'll need to change your Django template to include all the chunks

Open `catalog/templates/index.html` then update the template like the following

```html
{% load render_bundle from webpack_loader %}

<html  lang="en">
<head>
<meta  charset="UTF-8">
<title>Django - Auth0 - Vue</title>
{% render_bundle 'app' 'css' %}

</head>
<body>
<div  id=app>
</div>

{% render_bundle 'manifest' %}
{% render_bundle 'vendor' %}
{% render_bundle 'app' 'js' %}
</body>
</html>
```

You can try if that works for you using the Django server without the need to deploy to a production server. On e difference from the development setup is that you don't need to run the Vue dev server since you have the built files of your front-end app served by Django.

  
## Conclusion

You have reached the final of these series in which you have created a CRUD application with Django, Django REST framework and Vue. I hope you have enjoyed and thanks for reading! 
