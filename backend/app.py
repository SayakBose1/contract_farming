from flask import Flask
from flask_cors import CORS
import init

init.init()

from routes.test_routes import test_bp
from routes.auth_routes import auth_bp
from routes.locations_routes import locations_bp
from routes.master_routes import master_bp  
from routes.farms_routes import farms_bp 

app = Flask(__name__)

CORS(app, origins="*", supports_credentials=True)

app.register_blueprint(test_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(locations_bp)
app.register_blueprint(master_bp)    
app.register_blueprint(farms_bp)

@app.route("/")
def hello():
    return "Contract Farming API Running"

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, use_reloader=False, port=5005)
