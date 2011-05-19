#!/usr/bin/env python2

from django import template
register = template.Library()

@register.simple_tag
def active(request, pattern):
    import re
    if re.search(pattern, request.path):
        return 'current_page_item'
    return ''
