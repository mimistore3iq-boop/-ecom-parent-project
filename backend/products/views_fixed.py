
from django.shortcuts import render, redirect
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib import messages
from .models import Category
from .forms import CategoryForm


@staff_member_required
def add_category_view(request):
    """
    عرض لإضافة فئة جديدة
    """
    if request.method == 'POST':
        form = CategoryForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            messages.success(request, 'تمت إضافة الفئة بنجاح')
            return redirect('/admin/products/admin/category/add/success/')
    else:
        form = CategoryForm()

    return render(request, 'admin/products/add_category.html', {
        'form': form,
        'title': 'إضافة فئة جديدة'
    })


@staff_member_required
def category_list_view(request):
    """
    عرض لقائمة الفئات
    """
    categories = Category.objects.all()
    return render(request, 'admin/products/category_list.html', {
        'categories': categories,
        'title': 'قائمة الفئات'
    })


@staff_member_required
def category_add_success_view(request):
    """
    عرض رسالة نجاح بعد إضافة فئة
    """
    return render(request, 'admin/products/category_add_success.html', {
        'title': 'تمت إضافة الفئة بنجاح'
    })
