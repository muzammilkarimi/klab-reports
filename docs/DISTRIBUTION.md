# Distributing kLab Reports

Follow these steps to generate a professional installer for kLab Reports and share it with other users.

## 1. How to Build the App
To create a Windows installer (`.exe` file), run the following command in your terminal/command prompt:

```bash
npm run dist
```

This command will:
1.  **Build the Frontend**: Compile the React/Vite code for production.
2.  **Package the Backend**: Include the database and server logic.
3.  **Generate Installer**: Create a setup file in the `release` folder.

## 2. Where is the Installer?
Once the build is finished, you will find the installer file here:
- `d:\KLab_reports\release\kLab Reports Setup 1.0.3.exe` (The version number might vary).

## 3. How to Share it
Simply share this `.exe` file via USB, Google Drive, or email (if size permits). 

## 4. Installing on another PC
1.  **Run the Setup**: Double-click the `.exe` file on the new computer.
2.  **Follow Prompts**: Choose the installation location and install.
3.  **Launch**: Open the app from the Desktop or Start Menu.
4.  **Automatic Setup**: On the first run, the app will automatically:
    - Create a local database.
    - **Pre-load default medical tests** (CBC, LFT, KFT, etc.).
    - Create a default admin account (**Username**: `admin`, **Password**: `admin123`).

> [!TIP]
> **Data Portability**: If you want to move your existing data to another PC, you can copy the database file located at:  
> `%APPDATA%/kLab-Reports/database/klab.db`
