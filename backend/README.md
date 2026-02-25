# Club Hub API

This is the API for Club Hub, a platform for managing clubs and societies in schools and universities.

## Installation

1. Clone the repository

   ```bash
   git clone
   ```

2. Create a virtual environment

   ```bash
   python3 -m venv .venv
   ```

3. Activate the virtual environment
   POSIX(bash, zsh, etc.)

   ```bash
   source .venv/bin/activate
   ```

   Fish

   ```bash
   source .venv/bin/activate.fish
   ```

   PowerShell

   ```bash
   .venv\Scripts\Activate.ps1
   ```

   Windows Command Prompt

   ```bash
   .venv\Scripts\activate.bat
   ```

4. Install the dependencies

   ```bash
   pip install -r requirements.txt
   ```

## Usage

1. Run the server

   Development mode with live reload:

   ```bash
   fastapi dev
   ```

   Production mode:

   ```bash
   fastapi run
   ```

2. Reset Database

   From the backend/ directory,
   Drops all tables and data then re-creates them from schema:

   ```bash
   PYTHONPATH=.. python3 -m utils.reset
   ```

3. Seed Database

   From the backend/ directory,
   Loads sample data from csv files into database:

   ```bash
   PYTHONPATH=.. python3 -m utils.seed
   ```
