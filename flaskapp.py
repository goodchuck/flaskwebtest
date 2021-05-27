from flask import Flask, render_template
app=Flask(__name__)

@app.route("/")
def hello():
    return render_template('index.html')

@app.route("/S_PotholeState.html")
def test():
    return render_template('S_PotholeState.html')

if __name__=="__main__":
    app.run(host='0.0.0.0')
