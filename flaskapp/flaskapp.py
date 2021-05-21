from flask import Flask
app=Flask(__name__)

@app.route("/")
def hello():
    return "<h1>Hello Python Flask Dorosee!!!</h1>"

@app.route('/user')
def user():
    return 'Hello, User!'

if __name__=="__main__":
    app.run(host='0.0.0.0')
