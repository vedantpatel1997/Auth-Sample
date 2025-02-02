Sure! Here’s how you could structure the document in a GitHub README format for configuring authentication between a **Front-End Azure Web App** and a **Back-End Azure Container App** using **Azure EasyAuth**:

---

# **Configuring Authentication for Front-End Azure Web App and Back-End Azure Container App using Azure EasyAuth**

This guide provides step-by-step instructions to configure authentication between a **Front-End Azure Web App** and a **Back-End Azure Container App** using **Azure EasyAuth**. This solution uses minimal code changes by leveraging Azure’s built-in authentication feature (EasyAuth) to secure communication between the front-end and back-end apps.

## **Prerequisites**

Before starting, ensure you have the following:

- **Azure CLI** installed and authenticated.
- **Two separate App Registrations** in Azure Active Directory for both the front-end and back-end apps.
- **Front-End Web App** deployed on **Azure Web App**.
- **Back-End API** hosted on **Azure Container Apps**.
- **Client IDs** for both app registrations.

---

## **Step 1: Configure Authentication for the Front-End Web App**

1. **Go to your Front-End Web App in Azure Portal**:
   - Navigate to **Authentication** settings.
   - Select **Add Identity Provider**.
   - Choose **Azure Active Directory** with default settings (or use an existing one if already configured).

---

## **Step 2: Configure Authentication for the Back-End Container App**

1. **Go to your Back-End Container App in Azure Portal**:
   - Navigate to **Authentication** settings.
   - Select **Add Identity Provider**.
   - Choose **Azure Active Directory** with default settings (or use an existing one if already configured).

---

## **Step 3: Grant Permissions for Front-End App to Access Back-End App**

1. **Navigate to the Front-End App Registration** in Azure AD:
   - Go to **API Permissions**.
   - Click **Add a permission**.
   - Under **APIs my organization uses**, find the **Back-End App Registration**.
   - Assign the **user_impersonation** permission with **Delegated** access.

---

## **Step 4: Update Authentication Settings Using Azure CLI**

Now, we will update the authentication settings for both the front-end and back-end apps using Azure CLI.

1. **Add the `authV2` extension**:

    ```bash
    az extension add --name authV2
    ```

2. **Configure authentication settings for the Front-End Web App**:
    - Fetch the current authentication settings:

        ```bash
        authSettings=$(az webapp auth show -g <Respective-ResourceGroup> -n <front-end-app-name>)
        ```

    - Modify the authentication settings to include the necessary login parameters for Azure AD:

        ```bash
        authSettings=$(echo "$authSettings" | jq '.properties' | jq '.identityProviders.azureActiveDirectory.login += {"loginParameters":["scope=openid offline_access api://<back-end-client-id>/user_impersonation"]}')
        ```

    - Apply the updated authentication settings:

        ```bash
        az webapp auth set --resource-group <Respective-ResourceGroup> --name <front-end-app-name> --body "$authSettings"
        ```

3. **Configure authentication settings for the Back-End Container App**:
    - Fetch the current authentication settings:

        ```bash
        authSettings=$(az containerapp auth show -g <Respective-ResourceGroup> -n <back-end-app-name>)
        echo "$authSettings"
        ```

    - Update the back-end app’s authentication to allow the front-end app’s Client ID and back-end app’s Client ID:

        ```bash
        az containerapp auth update -g <Respective-ResourceGroup> --name <back-end-app-name> --set identityProviders.azureActiveDirectory.validation.defaultAuthorizationPolicy.allowedApplications=["<back-end-client-id>","<front-end-client-id>"]
        ```

    - Update the back-end app’s JWT claim validation to include the front-end app’s Client ID:

        ```bash
        az containerapp auth update -g <Respective-ResourceGroup> --name <back-end-app-name> --set identityProviders.azureActiveDirectory.validation.jwtClaimChecks.allowedClientApplications=["<front-end-client-id>"]
        ```

---

## **Step 5: Front-End Code Changes**

Now, you need to make minimal changes to the front-end code to send the authentication token along with the API request.

1. **Obtain the Authentication Token** from Azure AD:
   - In your front-end code, retrieve the token using the `x-ms-token-aad-access-token` header.

2. **Pass the Token in Authorization Header**:
   - When making requests to the back-end API, include the token as a **Bearer token** in the `Authorization` header.

Example of how to pass the token in the API request is given in Frontend >> index.js:


## **Conclusion**

You have successfully configured Azure EasyAuth for both the **Front-End Azure Web App** and the **Back-End Azure Container App**. The front-end app now uses Azure Active Directory to obtain a token, which is passed in the authorization header when making requests to the back-end app. This ensures secure and seamless authentication between the two applications with minimal code changes.

---

Let me know if you need any further adjustments to the document or clarification on any steps!