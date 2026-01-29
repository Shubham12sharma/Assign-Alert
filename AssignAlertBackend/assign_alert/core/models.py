from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.contrib.auth import get_user_model





# User Model
class User(AbstractUser):
    ROLE_CHOICES = (
        ('Super Admin', 'Super Admin'),
        ('Admin', 'Admin'),
        ('Member', 'Member'),
        ('Guest', 'Guest'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Member')


    main_community = models.CharField(max_length=24, blank=True, null=True)

   




# Community Model
User = get_user_model()

class Community(models.Model):
    name = models.CharField(max_length=255)
    parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sub_communities'
    )

    # ManyToManyField is the correct & standard way for membership
    members = models.ManyToManyField(
        User,
        related_name='communities',
        blank=True
    )

    # Optional: track creation & last activity
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    @property
    def member_count(self):
        return self.members.count()

    class Meta:
        ordering = ['name']
        verbose_name = "Community"
        verbose_name_plural = "Communities"


class CommunityInvite(models.Model):
    code = models.CharField(max_length=20, unique=True, db_index=True)
    community = models.ForeignKey(
        Community,
        on_delete=models.CASCADE,
        related_name='invites'
    )
    role = models.CharField(
        max_length=20,
        choices=[
            ("Super Admin", "Super Admin"),
            ("Admin", "Admin"),
            ("Member", "Member"),
            ("Guest", "Guest")
        ],
        default="Member"
    )
    email = models.EmailField(null=True, blank=True)
    invited_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sent_invites'
    )
    is_used = models.BooleanField(default=False)
    used_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='accepted_invites'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)  # Optional expiration

    def __str__(self):
        return f"{self.community.name} → {self.code} ({self.role})"

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Community Invite"
        verbose_name_plural = "Community Invites"


class Task(models.Model):
    PRIORITY_CHOICES = [
        ('High','High'),
        ('Medium','Medium'),
        ('Low','Low')
    ]

    STATUS_CHOICES = [
        ('To Do','To Do'),
        ('In Progress','In Progress'),
        ('Review','Review'),
        ('Done','Done')
    ]

    LEVEL_CHOICES = [
        ('Easy','Easy'),
        ('Medium','Medium'),
        ('Hard','Hard')
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()

    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES)
    task_level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    category = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)

    assignee = models.CharField(max_length=24, null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    estimated_hours = models.FloatField(null=True, blank=True)

    tags = models.JSONField(default=list, blank=True)
    attachments = models.JSONField(default=list, blank=True)
    comments = models.JSONField(default=list, blank=True)
    activity_logs = models.JSONField(default=list, blank=True)

    community = models.CharField(max_length=24, null=True, blank=True)
    is_personal = models.BooleanField(default=False)

    created_at = models.DateTimeField(default=timezone.now)





# Epic Model
class Epic(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20)

    start_date = models.DateTimeField()
    end_date = models.DateTimeField()

    community = models.CharField(max_length=24, null=True, blank=True)



# Sprint Model
class Sprint(models.Model):
    TYPE_CHOICES = [
        ('Weekly','Weekly'),
        ('Monthly','Monthly')
    ]

    name = models.CharField(max_length=255)
    goal = models.TextField()

    type = models.CharField(max_length=20, choices=TYPE_CHOICES)

    start_date = models.DateTimeField()
    end_date = models.DateTimeField()

    epic = models.CharField(max_length=24, null=True, blank=True)
    community = models.CharField(max_length=24, null=True, blank=True)

    retrospective = models.TextField(blank=True)
    velocity = models.FloatField(default=0)
    progress = models.FloatField(default=0)




# Alert Model
class Alert(models.Model):
    type = models.CharField(max_length=50)
    message = models.TextField()

    user = models.CharField(max_length=24)
    task = models.CharField(max_length=24, null=True, blank=True)
    sprint = models.CharField(max_length=24, null=True, blank=True)

    read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

