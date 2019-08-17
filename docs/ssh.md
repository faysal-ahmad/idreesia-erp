SSH Server is running on the erp server machine, and ngrok is setup to expose it. However the port on which we can connect to it is not permanent. Use the following command to connect to the ssh server after changing the port number

`ssh -p 11304 0.tcp.ngrok.io`
