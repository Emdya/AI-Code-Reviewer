import os

def insecure():
    user_input = "2 + 2"
    eval(user_input)  # Security issue
    print(  "Hello" )  # spacing issue (flake8)

def unused_function():
    pass  # unused
