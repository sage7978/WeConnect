from django.shortcuts import render
from django.shortcuts import HttpResponse
from django.contrib.auth import authenticate,login
from .forms import LoginForm
from django.contrib.auth.decorators import login_required
import threading
from queue import Queue
from django.http import JsonResponse

@login_required
def dashboard(request):
    try:
        rate=request.POST['rating']
        print(rate)
    except:
        pass
    return render(request,'account/dashboard.html',{'section':'dashboard'})

@login_required
def index(request):
    return render(request,'account/index2.html',{'section':'dashboard'})


qv = Queue()
def producev(uid):
    qv.put(uid)
#append error overflow //  put no overflow waits, till avail
#pop(0), 
def consumev():
    while(qv.qsize() >1):
        peer1=qv.get()
        peer2=qv.get()
        print(peer1, peer2, 'voice')


qt = Queue()
def producet(uid):
    qt.put(uid)

def consumet():
    while(qt.qsize() >1):
        peer1=qt.get()
        peer2=qt.get()
        print(peer1, peer2, 'text')




def pairer(request):
    choice = request.GET['choice']
    pass
    

    # if(choice =='voice'):
    #     t1 = threading.Thread(target=producev, args=(request.user.username,))
    #     t2 = threading.Thread(target=consumev)
    #     t1.start()
    #     t2.start()
    #     print(t1)
    #     print(t2)
    # elif(choice =='text'):
    #     t1 = threading.Thread(target=producet, args=(request.user.username,))
    #     t2 = threading.Thread(target=consumet)
    #     t1.start()
    #     t2.start()
    #     print(t1)
    #     print(t2)

    # return HttpResponse(choice)    


def pairer2(request):
    if request.method == 'GET':
        response_data = {}
        if(qt.empty()):
            #print(request.GET['id'])
            qt.put(request.GET['id'])
            response_data["status"] = "wait"
            #print("Wait Side")
        else:
            response_data["status"] = "join"
            second = qt.get()
            response_data["peer_id"] = second
        return JsonResponse(response_data)     
    else:
        response_data = {}
        response_data["status"] = "error"
        response_data["expand"] = "Request method is not a GET"
        return JsonResponse(response_data)  
    



def user_login(request):
    if request.method =='POST':
        form=LoginForm(request.POST)
        if form.is_valid():
            cd = form.cleaned_data
            user = authenticate(request,username=cd['username'],password=cd['password'])
            if user is not None:
                login(request,user)
                return HttpResponse('Login Sucessful')
            else:
                return HttpResponse('Invalid Credentials')
    else:
        form=LoginForm()

    return render(request,'account/login.html',{'form':form})


def rater(request):
    #rate = request.GET['rating']
    #print(rate)
    return render(request, 'account/rating.html')  



