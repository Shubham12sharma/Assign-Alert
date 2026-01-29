from django.contrib import admin

from .models import User,Sprint, Task, Community, Epic, Alert

# Register your models here.

  
admin.site.register(User)
admin.site.register(Community)
admin.site.register(Task)
admin.site.register(Epic)
admin.site.register(Sprint)
admin.site.register(Alert)