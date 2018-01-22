---
layout: post
title: "Building a Modern Web Application with Django REST Framework and Vue.js: Part 1"
description: "In this tutorial, we'll cover the first part of building a demo application with Django and Django REST framework for the API back-end and a Vue.js front-end. We'll first start by bootstrapping the Django project, then bootstrap the Vue.js front-end and finally secure the app with Auth0."
date: "2018-01-08 08:30"
author:
  name: "Ahmed Bouchefra"
  url: "https://www.techiediaries.com"
  mail: "techiediaries9@gmail.com"
  avatar: "https://twitter.com/ahmedbouchefra/profile_image?size=original"
---


Throughout this  tutorial we'll be using Django, Django REST framework and Vue.js to develop a CRUD (Create, Read, Update and Delete) application with a REST API back-end and a Vue.js front-end. The API will be consumed using the Axios client and JWT authentication will be handled by Auth0.
We are going to start by installing the project's requirements then bootstrap the Django and the Vue.js projects.
You can find the source code of the demo project we will  create throughout this tutorial series in this [Github repository](https://github.com/techiediaries/django-auth0-vue)

## Summary

This article is composed of the following sections:

* Introduction to Python and Django
* Introduction to Vue.js and Vue.js features
* Bootstrapping the back-end project
* Bootstrapping the front-end project
* Introduction to JSON Web Tokens
* Integrating Django with Auth0
* Integrating Auth0 with The Vue.js Front-end
* Conclusion and next steps


## Introduction to Python and Django

Python is a general purpose programming language. It's among the most popular programming languages in the world. It's readable, efficient and [easy to learn](http://lifehacker.com/five-best-programming-languages-for-first-time-learners-1494256243/1497409477). Python is a portable language available for major operating systems such as Linux, Windows and MAC.

![](https://i.kinja-img.com/gawker-media/image/upload/19bwpujkmuzhwjpg.jpg)
[Source](https://lifehacker.com/five-best-programming-languages-for-first-time-learners-1494256243/1497409477)

For web developers, Python has many great tools and frameworks that make developers more productive and able to build prototypes in time. Among the most popular web frameworks across the Python community is Django. It's being advertised as the framework for perfectionists with deadlines because of its ability to allow developers to quickly build prototypes and then offer the required tools to build the complete application in a time record.

Django uses the power of Python to offer developers a great set of features such as class based views and a powerful ORM that you can use to model your database requirements without writing any single line of SQL. The Django ORM abstracts away all the complexities of working with databases and most importantly doesn't intimidate you when your client has not decided yet on the database system to use, you can start development using a SQLite database which doesn't need any special installation then switch to the right database system later on when you have settled on the right RDBMS (Relational Database Management System) to use for your project data storage and retrieval.

Django also comes with a powerful migration system that allows you to migrate your database safely and without losing your data when you make changes to the database structure later on.

Django has a big and an evolving community which has created open source packages for common web development problems so you don't need to reinvent the wheel when building your project.

Django has an excellent and complete documentation for all the features of the framework supplemented by a set of tutorials created by the community which in many situations can be simpler to understand than the official documentation.
Django is suitable for beginners and you don't have to be an expert with every feature of the framework to start building your web application.   

## Introduction to Vue.js and Vue.js Features

Vue.js is a progressive framework for building user interfaces with JavaScript. You can use Vue.js in the view layer of your application or it can also be used to build Single Page Applications by combining it with other front-end [tools](https://vuejs.org/v2/guide/single-file-components.html).

Vue.js took the best of both Angular.js and React into one library. For example just like React, Vue uses the virtual DOM and a component-based approach. It also uses similar syntax to the Angular.js templates (for example `v-if` and `v-for` etc.)
Vue.js has many features such as:

* virtual DOM

* reactive and composable view components

* performance

* native rendering on iOS and Android thanks to [Weex](https://weex.incubator.apache.org/) and [NativeScript](https://github.com/rigor789/nativescript-vue)

## Bootstrapping the Back-end Project

Before you can create the back-end project you need to install some requirements in your development machine. For Django you need to have Python 3 (the latest version of Django requires Python 3), PIP and `venv` installed.

Please note that you don't need to install a full fledged database management system to develop with Django. You can use a SQLite database which allows you to have a file-based database that doesn't require any special installation.

### Installing the Requirements

Let's start with Python 3. Chances are that you already have Python 3 installed on your machine if not, then the process is simple you just need to head over to their [official website then navigate to the downloads page](https://www.python.org/downloads/) and pick the installer for your operating system.

![](https://screenshotscdn.firefoxusercontent.com/images/6b9c7fa1-5b30-4a33-81e7-0c98ca3124f9.png)

You can check if you have Python 3 installed by running the following command from your terminal or command prompt:

```bash
python3 --version
```

For `venv` it's installed by default with Python 3. The `venv` module (part of the Python 3 standard library) allows you to create lightweight virtual environments for your projects so you can have an isolated environment for each Python project (isolated from each project and from the system wide packages), that means each project may have its own dependencies.

Setting up an isolated environment provides you with more control over the installed Python packages, you can have different versions for the same package without having to worry about any conflicts which allows you to work with different Python projects with different packages or same packages with different versions. Also, since each environment can have its own Python binary this allows you to create various environments with different Python versions.

Once you create a virtual environment, `venv` will take care of installing the latest Python binary
Next you need to install [pip](https://packaging.python.org/key_projects/#pip), a package manager for Python that, by default, installs packages from the Python Package Index ([PyPI](https://pypi.python.org/pypi)).

You can verify if pip is installed on your development machine by running the following command:

```bash
pip --version
```

You should have pip installed if you have installed Python using the official [python.org](https://www.python.org/downloads) installer or via Homebrew in MAC (Also if you are inside a `venv` environment, pip is already installed). For Linux, you may need to install it separately. See this [guide](https://packaging.python.org/guides/installing-using-linux-tools/) and [this](https://pip.pypa.io/en/stable/installing/).


### Creating a Virtual Environment

Once you have all the back-end requirements installed, let's create a virtual environment for installing our project dependencies so head back to your terminal and run the following command:

```bash
python3 -m venv ./nenv
```

Next you need to activate the environment using `source`:

```bash
source nenv/bin/activate
```

You can now install Django using `pip`:

```bash
pip install django
```

The next step is to create the django project using:

```bash
django-admin startproject djangovuejsproject
```

Navigate inside your project's root folder then create a Django application

```bash
cd djangovuejsproject
python manage.py startapp catalog
```

Now you need to add this app to the list of installed apps. Open your project `settings.py` file then add the app:

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'catalog'
]
```

You can then migrate your database then start the development server

```bash
python manage.py migrate
python manage.py runserver
```

Next, navigate to [http://127.0.0.1:8000](http://127.0.0.1:8000) with your web browser.

You should see the following home page

![django start page](https://screenshotscdn.firefoxusercontent.com/images/622ea6ae-dee4-47ef-895a-e2b9307e7c68.png)


## Bootstrapping the Front-end Project


Vue.js has a [CLI utility](https://github.com/vuejs/vue-cli) that allows Vue developers to quickly generate single page applications. The CLI offers pre-configured build setups for a modern frontend workflow and takes only some minutes to scaffold a basic project boilerplate with features such as hot-reloading, lint-on-save, and production-ready builds.

Before you can install the Vue CLI you need to have a development environment with Node.js >=6.x, npm version 3+ (and optionally Git) installed. You can install both of them by heading to the [official Node.js website](https://nodejs.org/en/download/) and download the right installer for your operating system.

![Nodejs official page](https://screenshots.firefoxusercontent.com/images/531385b3-4ad5-4b68-8452-234fb7af3f7c.png)

Next head over to your terminal or command prompt then run the following command:

```bash
npm install -g vue-cli
```

You may need to add `sudo` to the npm command for installing commands globally, depending on your [npm configuration](https://docs.npmjs.com/getting-started/fixing-npm-permissions).


After installing the Vue CLI, let's use it to generate a new Vue application based on the [webpack template](https://github.com/vuejs-templates/webpack).

Inside the django project's root folder run the following command:

```bash
vue init webpack frontend
cd frontend
npm install
npm run dev
```

You should be able to visit the Vue application with your browser by navigating to [http://127.0.0.1:4000](http://127.0.0.1:4000)

## Introduction to JWT


[JWT](https://jwt.io/) stands for JSON Web Token and it's simply a JSON (JavaScript Object Notation) object/payload that contains a claim.

Here is how it's defined in [RFC 7519](https://tools.ietf.org/html/rfc7519)

>JSON Web Token (JWT) is a compact, URL-safe means of representing
claims to be transferred between two parties.  The claims in a JWT
are encoded as a JSON object that is used as the payload of a JSON
Web Signature (JWS) structure or as the plaintext of a JSON Web
Encryption (JWE) structure, enabling the claims to be digitally
signed or integrity protected with a Message Authentication Code
(MAC) and/or encrypted.

A JWT has three parts:  a header, a payload, and a signature. The header contains informations such as the algorithm to be used for signing the payload and the header (e.g HS256) and the payload holds the claims to make.


## Creating an Auth0 Resource/API


Before you can use Auth0 authentication with your application you first need to create an Auth0 account then head over to the [dashboard](https://manage.auth0.com/) 

![Auth0 Dashboard](https://screenshotscdn.firefoxusercontent.com/images/fce95f70-646d-4994-8428-9f719982cb32.png)

Next head to the [API section](https://manage.auth0.com/#/apis) and click on the *CREATE API* button. 

![Auth0 API Section](https://screenshotscdn.firefoxusercontent.com/images/61224ef4-dab5-47bb-b0fd-bc18c3c65590.png)

You'll be presented with a form to fill in your API details: the name, the identifier and the signing algorithm   

![Auth0 CREATE API Form](https://screenshotscdn.firefoxusercontent.com/images/4f6d02f4-ba10-4657-b5c1-39d7bf0ad170.png)

Enter the details and click on the *CREATE* button. You'll be taken to a page where you can further customize your API settings and create test clients etc.

![Auth0 API Settings](https://screenshotscdn.firefoxusercontent.com/images/4f5f0184-5df3-472a-a0b5-a52d5172fac1.png)

That's it! You are now ready to integrate your Django application with Auth0


## Integrating Django with Auth0


In this section we'll see how to secure the Django REST API with Auth0.

In the next part we'll build the API but before that let's add JWT authentication to our back-end using Auth0.
For this reason, we'll need to first install Django REST framework and the `djangorestframework-jwt` package for handling JWT authentication in DRF then we'll setup `djangorestframework-jwt` to use Auth0 for signing the JWT tokens.

So head back to your terminal, make sure the virtual environment we previously created is activated then run the following command to install both packages using `pip`

```bash
pip install djangorestframework
pip install djangorestframework-jwt
pip install cryptography
pip install python-jose
```

Make sure to install dev files for Python 3 `python3-dev` if you get problems when installing the cryptography package.

Next you'll need to add these packages to the list of installed apps in `settings.py`

```python
INSTALLED_APPS = [
    #...
    'rest_framework',
    'rest_framework_jwt'
]
```

Add `JSONWebTokenAuthentication` to `DEFAULT_AUTHENTICATION_CLASSES`:

```python
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
       'rest_framework_jwt.authentication.JSONWebTokenAuthentication',
    ),
}
```

Next make sure to import the following dependencies in your `settings.py` file

```python
import json
from six.moves.urllib import request
from cryptography.x509 import load_pem_x509_certificate
from cryptography.hazmat.backends import default_backend
```

Then add the following code

```python
AUTH0_DOMAIN = '<YOUR_AUTH0_DOMAIN>'
API_IDENTIFIER = '<YOUR_API_IDENTIFIER>'
PUBLIC_KEY = None
JWT_ISSUER = None
if AUTH0_DOMAIN:
    jsonurl = request.urlopen('https://' + AUTH0_DOMAIN + '/.well-known/jwks.json')
    jwks = json.loads(jsonurl.read().decode('utf-8'))
    cert = '-----BEGIN CERTIFICATE-----\n' + jwks['keys'][0]['x5c'][0] + '\n-----END CERTIFICATE-----'
    certificate = load_pem_x509_certificate(cert.encode('utf-8'), default_backend())
    PUBLIC_KEY = certificate.public_key()
    JWT_ISSUER = 'https://' + AUTH0_DOMAIN + '/'
def jwt_get_username_from_payload_handler(payload):
    return 'auth0user'
JWT_AUTH = {
    'JWT_PAYLOAD_GET_USERNAME_HANDLER': jwt_get_username_from_payload_handler,
    'JWT_PUBLIC_KEY': PUBLIC_KEY,
    'JWT_ALGORITHM': 'RS256',
    'JWT_AUDIENCE': API_IDENTIFIER,
    'JWT_ISSUER': JWT_ISSUER,
    'JWT_AUTH_HEADER_PREFIX': 'Bearer',
}
```

Make sure to replace `AUTH0_DOMAIN` with your own Auth0 domain and `API_IDENTIFIER` with your own API identifier.

The public key is retrieved from  `https://YOUR_AUTH0_DOMAIN/.well-known/jwks.json` using the `request.urlopen()` method then assigned to `PUBLIC_KEY` in `JWT_AUTH` (the settings object for `djangorestframework-jwt`).

`JWT_ISSUER` is your Auth0 domain name prefixed by https.

`JWT_ALGORITHM` needs to be set to **RS256** so you need to make sure your Auth0 API is using **RS256**.

The `JWT_AUTH_HEADER_PREFIX` is set to **Bearer** the default prefix used by Auth0 (`djangorestframework-jwt` uses a **JWT** prefix by default).

We have also set `JWT_PAYLOAD_GET_USERNAME_HANDLER` to a custom method. This tells `djangorestframework-jwt` to use our custom method in order to map the username from the **access_token** payload to the Django user.

For most cases, you don't need to store users in your database since Auth0 handles all of that for you including advanced features such as profiles. So we can use a custom function that checks if a general (can be fake) user that we create exists and map it to all Auth0 users.  

So head over to your application and create a user with any valid username such as *auth0user*, you can do that through Django admin interface or in a migration by adding the following code.

First create an empty data migration:


```bash
python manage.py makemigrations --empty catalog
```

Then use the `RunPython()` method to execute a function that creates the user


```python
    
from django.db import migrations
from django.conf import settings
def create_data(apps, schema_editor):
    User = apps.get_model(settings.AUTH_USER_MODEL)
    user = User(pk=1, username="auth0user", is_active=True , email="admin@techiediaries.com")
    user.save()
class Migration(migrations.Migration):
    dependencies = [
        ('catalog', '0001_initial'),
    ]
    operations = [
        migrations.RunPython(create_data),
    ]
    
```

For more information see [the docs about data migrations in Django](https://docs.djangoproject.com/en/2.0/topics/migrations/#data-migrations)

Next just run migrate to create your initial data:

```bash
python manage.py migrate
```

This is the custom method that maps the JWT payload with the *auth0user* user:

```python
def jwt_get_username_from_payload_handler(payload):
    return 'auth0user'
```

Please note that you can return the username of any existing user in the database because we are not going to use this for anything besides the sole purpose of letting `djangorestframework-jwt` successfully authenticate the user once the JWT token is found valid.


### Adding Django Views


To make sure the JWT authentication via Auth0 is working. You can add these two view functions in `catalog/views.py`:  

```python
from rest_framework.decorators import api_view
from django.http import HttpResponse
def public(request):
    return HttpResponse("You don't need to be authenticated to see this")
@api_view(['GET'])
def private(request):
    return HttpResponse("You should not see this message if not authenticated!");
```

Make sure also to create the corresponding URLs in `urls.py`:


```python
from django.conf.urls import url
from . import views
urlpatterns = [
    url(r'^api/public/', views.public),
    url(r'^api/private/', views.private)
]
```

In the next part we will create the actual API endpoints.



## Integrating Auth0 with The Vue.js Front-end


In this section we'll see how we can add Auth0 authentication to our front-end Vue application and add some a button to communicate with our protected endpoint


### Creating an Auth0 Client


Go to your [Auth0 dashboard](https://manage.auth0.com/), then click on the *NEW CLIENT* button


![Create new client](https://screenshotscdn.firefoxusercontent.com/images/3f2d874d-5f2b-48ba-8769-8333b5171ce2.png)

Or you can also navigate to the *Clients* section and then click on the *CREATE CLIENT* button


![Create new client](https://screenshotscdn.firefoxusercontent.com/images/9c35fa7f-2c22-4f55-9562-bf5070f45ef2.png)


You should be presented with a page where you can enter the name of the client and the type of the client

![New client details](https://screenshotscdn.firefoxusercontent.com/images/bccd98ac-e69f-42f5-ac54-7cc07638722b.png)


Enter a name for your client, select *Single Page Web Applications* type then click on *CREATE*


You should be redirected to a page where you can find different tabs for quickstart information and settings etc.   


![Client details](https://screenshotscdn.firefoxusercontent.com/images/4124eb81-689a-4e8c-b576-3ce99581118f.png)


### Configuring the Callback URL


You need to whitelist the callback URL for your app (`http://localhost:8080/`) in the *Allowed Callback URLs* field in your Client Settings.

![Configuring the callback URL](https://screenshotscdn.firefoxusercontent.com/images/0953b85b-0728-44b7-bad7-51c0522d18fd.png)


### Creating the Authentication Service


Now let's install the `auth0.js` and EventEmitter libraries and create an authentication service which is going to encapsulate the code needed for interfacing with Auth0.

```bash
npm install --save auth0-js
npm install --save EventEmitter
```

You also need to install Axios for sending API requests to the Django back-end

```bash
npm install --save axios
```

Create a `src/auth/AuthService.js` file then add the following code

```js
import auth0 from 'auth0-js'
import EventEmitter from 'eventemitter3'
import router from './../router'

export default class AuthService {
  authenticated = this.isAuthenticated()
  authNotifier = new EventEmitter()

  constructor () {
    this.login = this.login.bind(this)
    this.setSession = this.setSession.bind(this)
    this.logout = this.logout.bind(this)
    this.isAuthenticated = this.isAuthenticated.bind(this)
    this.handleAuthentication = this.handleAuthentication.bind(this)
  }
  // create an instance of auth0.WebAuth with your API and Client credentials 
  auth0 = new auth0.WebAuth({
    domain: <YOUR_AUTH0_DOMAIN>,
    clientID: <YOUR_CLIENT_ID>,
    redirectUri: <YOUR_CALLBACK_URL>,
    audience: <YOUR_AUDIENCE>,
    responseType: 'token id_token',
    scope: 'openid profile'
  })
  // this method calls the authorize() method which triggers the Auth0 login page
  login () {
    this.auth0.authorize()
  }
  // this method calls the parseHash() method of auth0 to get authentication information from the callback URL
  handleAuthentication () {
    console.log("handling auth");
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult)
        router.replace('/')
      } else if (err) {
        router.replace('/')
        console.log(err)
        alert(`Error: ${err.error}. Check the console for further details.`)
      }
    })
  }
  //stores the user's access_token, id_token, and a time at which the access_token will expire in the local storage
  setSession (authResult) {
    // Set the time that the access token will expire at
    let expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    )
    localStorage.setItem('access_token', authResult.accessToken)
    localStorage.setItem('id_token', authResult.idToken)
    localStorage.setItem('expires_at', expiresAt)
    this.authNotifier.emit('authChange', { authenticated: true })
  }
  // remove the access and ID tokens from the local storage and emits the authChange event
  
  logout () {
    localStorage.removeItem('access_token')
    localStorage.removeItem('id_token')
    localStorage.removeItem('expires_at')
    this.authNotifier.emit('authChange', false)
    // navigate to the home route
    router.replace('/')
  }
  
  // checks if the user is authenticated
  isAuthenticated () {
    // Check whether the current time is past the
    // access token's expiry time
    let expiresAt = JSON.parse(localStorage.getItem('expires_at'))
    return new Date().getTime() < expiresAt
  }
  
  // a static method to get the access token
  static getAuthToken(){
    return localStorage.getItem('access_token');
  }
  
  //a method to get the User profile 
  getUserProfile(cb){
    var accessToken =  localStorage.getItem('access_token')
    if(accessToken) return this.auth0.client.userInfo(accessToken, cb);
    else return null; 
  }
}
```

You need to replace <YOUR_AUTH0_DOMAIN>, <YOUR_CLIENT_ID>, <YOUR_CALLBACK_URL> and <YOUR_AUDIENCE> with the values from your client and API settings.


### Creating the Template


Open `src/App.vue` then add the following template to create three buttons for login, logout and for sending a request to a private endpoint

```html
<template>
<div>
          <button
            class="btn btn-primary btn-margin"
            v-if="!authenticated"
            @click="login()">
              Log In
          </button>

          <button
            class="btn btn-primary btn-margin"
            v-if="authenticated"
            @click="private()">
              Call Private
          </button>

          <button
            class="btn btn-primary btn-margin"
            v-if="authenticated"
            @click="logout()">
              Log Out
          </button>
          {{message}}
          <br>


</div>  
</template>
```

### Creating the Methods


In `src/App.vue` add this code in the `<script>` tag

```js
import AuthService from './auth/AuthService'
import axios from 'axios'
const API_URL = 'http://localhost:8000'
```

This imports the AuthService, we previously created, from `./auth/AuthService` and the axios client then declares the *API_URL* constant which holdes the URL of the back-end server. 

Next create an instance of the AuthService 

```js
const auth = new AuthService()
```

Next in your `data()` method add the following code:

```js
  data () {
    this.handleAuthentication();
    this.authenticated = false;
    
    auth.authNotifier.on('authChange', authState => {
      this.authenticated = authState.authenticated
    })

    return {
      authenticated: false,
      message:''
    }
  }
```

We listen for the authChange event emited by AuthService when the authentication state changes and then assign the result to `authenticated` variable. We also set the `message` variable to the empty string. `message` will hold the responce from our protected endpoint.


Then add these methods:


```js
  methods: {
    // this method calls the AuthService login() method
    login(){
      auth.login();
    },
    handleAuthentication(){
      auth.handleAuthentication();
    },
    logout(){
      auth.logout();
    },
    private(){
      const url = `${API_URL}/api/private/`;
      return axios.get(url, { headers: { Authorization: `Bearer ${AuthService.getAuthToken()}` }}).then( (response) => { console.log(response.data); this.message = response.data || '';});
    }
  }
```

`login()`, `handleAuthentication()` and `logout()` methods are simply wrappers for the corresponding methods in AuthService.


In the `private()` method we use `axios.get()` method to send a GET request to  `http://localhost:8000/api/private/`. Since this endpoint is protected by Auth0 we also added an Authorization header. The access token is retrieved from the local host using `AuthService.getAuthToken()` method.  


You can get the code for this part from this [Github repository](https://github.com/techiediaries/django-auth0-vue-part1)

You can login from this page

![Login page](https://screenshotscdn.firefoxusercontent.com/images/f5daba7f-a948-47ac-bf1a-7e4ccf641643.png)


You'll be redirected to Auth0 central login page 

![Auth0 auth page](https://screenshotscdn.firefoxusercontent.com/images/b59a1a2e-70a6-460a-8626-e628ed0fd02b.png)


After authentication you'll be able to send a request to the protected endpoint 

![page after authentication](https://screenshotscdn.firefoxusercontent.com/images/61fa4449-c16a-4c2c-9a8e-7fc40f135251.png)


If the request is successfully sent you should get this massage `You should not see this message if not authenticated!` 

![private message](https://screenshotscdn.firefoxusercontent.com/images/1a9c8aef-ce66-46c8-85cd-26042f47244f.png)


## Conclusion and Next Steps


In this article we have bootstrapped both the back-end project with Django and the front-end application using the Vue CLI. We have also added JWT authentication to our back-end using Auth0. In the next part we will see how to create the REST API using Django REST framework and then how to consume it from the Vue.js front-end using Axios. We'll also see how to create our project front-end views so stay tuned!

These are some screenshots from the demo project we are going to continue building in the next parts:

![demo app](https://camo.githubusercontent.com/108cac1baf92e9ea68ec1326fd2cb2292266a718/68747470733a2f2f73637265656e73686f74732e66697265666f7875736572636f6e74656e742e636f6d2f696d616765732f36323663303262302d616363622d343561362d623430622d6565633465613331333337342e706e67)

![demo app](https://camo.githubusercontent.com/7085b3824c7ab564a09e761f0e5cf58f05123f25/68747470733a2f2f73637265656e73686f74732e66697265666f7875736572636f6e74656e742e636f6d2f696d616765732f37386131393135322d306565302d346462632d383636622d3930393864346533626534342e706e67)





