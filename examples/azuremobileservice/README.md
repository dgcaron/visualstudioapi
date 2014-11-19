### Azure Mobile Service Example

this example shows how you can use the token client to store the tokens in a table on a mobile service instance. This has the main advantage that people only have to authorize once and can connect and use the api with multiple devices. 

### Prerequisites
####Azure Mobile Service with a table created to store the tokens.
This demo uses a mobile service hosted on Windows Azure. You can register for free and get started today via http://azure.microsoft.com/en-us/pricing/free-trial/. 

When you login on the portal you can create a free mobile service with javascript backend and get started right away. Start by adding one or more authentication providers to your app. A detailed description can be found at http://azure.microsoft.com/en-us/documentation/articles/mobile-services-html-get-started-users/. We will use these users to store their authentication in a secured table in the service. A token is obtained by redirecting a user to an url where the user needs to sign in with his visual studio online account. this is explained on the visual studio online site itself: http://www.visualstudio.com/en-us/integrate/get-started/get-started-auth-oauth2-vsi. The image presented on that page is a good representation of what we are building here. For these tokens we create a table called authorizations. Finally, we need to create an API entry called authorize and change the access for get operations to everyone. Change the put access to authorized users.  

######A small recap:
- Create a mobile service with a javascript backend
- Add an authentication provider to the service
- Implement the authentication flow in your app
- Pass the userid of the authenticated app in the State parameter of the authorization url. 
- Add a table to store the tokens (add the code from tables\authorizations.read.js)
- Update the package.json of the service to include the visualstudio-client package.
- Add an API to serve as callback uri, (add the code from api\authorize.js)

####Registered Visual Studio Online Application
Login and register your app on https://app.vssps.visualstudio.com/app/register. Take note of the clientid, secret and select the appropriate scopes (you can't change them afterwards). Set the callback url to https://<yourname>.azure-mobile.net/api/authorize. This is where the oauth consent is sent to after the user grants your app access to his information.

####Refresh an expired token
Tokens have a limited lifespan and need to be refreshed. You can refresh the token to call the Authorize API with and put request as an authenticated user. This will lookup the token for that user and refresh it with visual studio. After a succesfull refresh it updates the token with the new values for future use.

