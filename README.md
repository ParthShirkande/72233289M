# Stock Price App

### Setup
# Stock Price App

A full-stack web application for viewing stock prices and correlation heatmaps.

---

## Setup

### 1. Clone the Repository

```sh
git clone <your-repo-url>
cd stock-service
```

---

### 2. Backend Setup

1. Go to the backend folder:
    ```sh
    cd stockmicroservicesbkd
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Ensure your `.env` file exists with the following content (already present in your project):
    ```
    PORT=5000
    AUTH_TOKEN=Bearer <your-token>
    ```

4. **Fix fetch issue:**  
   Make sure you are using `node-fetch@2`:
    ```sh
    npm uninstall node-fetch
    npm install node-fetch@2
    ```

5. Start the backend server:
    ```sh
    npm start
    ```
    The backend will run on [http://localhost:5000](http://localhost:5000).

---

### 3. Frontend Setup

1. Open a new terminal and go to the frontend folder:
    ```sh
    cd ../stockfd
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Start the frontend development server:
    ```sh
    npm run dev
    ```
    The frontend will run on [http://localhost:3000](http://localhost:3000).

---


### Screenshots

![Screenshot 2025-06-04 140718](https://github.com/user-attachments/assets/80cd5e90-3593-4283-bbde-98e6b58ae1f3)

![Screenshot 2025-06-04 134609](https://github.com/user-attachments/assets/6ae0b1bb-70c5-40c2-b1a8-c5e8469ee071)

