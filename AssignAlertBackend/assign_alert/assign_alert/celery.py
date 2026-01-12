import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'assign_alert.settings')

app = Celery('assign_alert')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')