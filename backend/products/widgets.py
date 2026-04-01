"""
Custom widgets for product admin
"""
import base64
import requests
from django import forms
from django.conf import settings
from django.utils.safestring import mark_safe


class ImgBBUploadWidget(forms.TextInput):
    """
    Custom widget for uploading images to ImgBB
    Renders HTML directly without needing a template file
    """
    
    def __init__(self, attrs=None):
        default_attrs = {'class': 'vTextField'}
        if attrs:
            default_attrs.update(attrs)
        super().__init__(default_attrs)
    
    def render(self, name, value, attrs=None, renderer=None):
        """Render the widget with upload button"""
        html = super().render(name, value, attrs, renderer)
        
        # Add upload button and preview
        upload_html = f'''
        <div class="imgbb-upload-widget" style="margin-top: 10px;">
            <input type="file" 
                   id="imgbb_file_{name}" 
                   accept="image/*" 
                   style="display: none;"
                   onchange="uploadToVoro_{name}(this)">
            <button type="button" 
                    onclick="document.getElementById('imgbb_file_{name}').click()" 
                    class="button"
                    style="padding: 8px 16px; background: #6f42c1; color: white; border: none; border-radius: 4px; cursor: pointer;">
                📤 رفع صورة إلى voro (R2)
            </button>
            <div id="imgbb_preview_{name}" style="margin-top: 10px;">
                {f'<img src="{value}" style="max-width: 200px; max-height: 200px; border: 1px solid #ddd; border-radius: 4px; padding: 4px;">' if value else ''}
            </div>
            <div id="imgbb_status_{name}" style="margin-top: 10px; color: #666;"></div>
        </div>
        <script>
        function uploadToVoro_{name}(input) {{
            const file = input.files[0];
            if (!file) return;
            
            const statusDiv = document.getElementById('imgbb_status_{name}');
            const previewDiv = document.getElementById('imgbb_preview_{name}');
            const urlInput = document.getElementById('id_{name}');
            
            statusDiv.innerHTML = '<span style="color: #6f42c1;">⏳ جاري رفع الصورة...</span>';
            
            const formData = new FormData();
            formData.append('image', file);
            
            fetch('/api/products/upload-image/', {{
                method: 'POST',
                body: formData
            }})
            .then(response => response.json())
            .then(data => {{
                if (data.url) {{
                    const imageUrl = data.url;
                    urlInput.value = imageUrl;
                    previewDiv.innerHTML = '<img src="' + imageUrl + '" style="max-width: 200px; max-height: 200px; border: 1px solid #ddd; border-radius: 4px; padding: 4px;">';
                    statusDiv.innerHTML = '<span style="color: #28a745;">✅ تم رفع الصورة بنجاح!</span>';
                    console.log('Image uploaded to voro R2:', imageUrl);
                }} else {{
                    statusDiv.innerHTML = '<span style="color: #dc3545;">❌ فشل رفع الصورة: ' + (data.error || 'خطأ غير معروف') + '</span>';
                }}
            }})
            .catch(error => {{
                statusDiv.innerHTML = '<span style="color: #dc3545;">❌ خطأ في الاتصال: ' + error.message + '</span>';
                console.error('Voro upload error:', error);
            }});
        }}
        </script>
        '''
        
        return mark_safe(html + upload_html)
        
        return mark_safe(html + upload_html)
    
    class Media:
        css = {
            'all': ()
        }
        js = ()