# Muse Microservices
This is a microservices based project containing several services required by multiple apps that I am working on. Through this, I am practicing several microservices concepts and trying to create some useful apps. Will update about each service as and when they become ready.

Internet
   |
NGINX Ingress Controller (Load balancing, SSL, scaling, path routing, sticky sessions, rate limit etc.)
   |
API Gateway
   |
Kubernetes Services
   |
Pods

to

Internet
   |
Cloud Load Balancer
   |
NGINX Ingress
   |
Kubernetes Cluster
   |
Gateway Pods
   |
Microservices
   |
Redis/Kafka/DB


---
brew install nginx
apple silicon: /opt/homebrew/etc/nginx/nginx.conf
intel mac: /usr/local/etc/nginx/nginx.conf

OR linux:
sudo apt update
sudo apt install nginx
/etc/nginx/nginx.conf

inside http{}
upstream api_gateway {
    server localhost:3000;
}

server {
    listen 80;

    location / {
        proxy_pass http://api_gateway;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

nginx -t (verify contents and syntax in conf file to be correct)
brew services restart nginx

access logs
tail -f /usr/local/var/log/nginx/access.log
error logs
tail -f /usr/local/var/log/nginx/error.log
