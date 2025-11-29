# import mysql.connector
# import os
# from dotenv import load_dotenv

# load_dotenv()

# db = mysql.connector.connect(
#     host=os.getenv("DB_HOST"),
#     user=os.getenv("DB_USER"),
#     password=os.getenv("DB_PASSWORD"),
#     database=os.getenv("DB_NAME")
# )

import pymysql
import os

def get_db():
    return pymysql.connect(
        host=os.environ.get("DB_HOST", "localhost"),
        user=os.environ.get("DB_USER", "root"),
        password=os.environ.get("DB_PASSWORD", ""),
        db=os.environ.get("DB_NAME", "sisjk"),
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
    )
