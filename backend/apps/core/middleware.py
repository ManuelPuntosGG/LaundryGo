class PermissionsPolicyMiddleware:
    """
    Sets Permissions-Policy header to allow 'unload' event,
    resolving Chrome/Chromium [Violation] Permissions policy violation
    in Django admin's RelatedObjectLookups.js.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response['Permissions-Policy'] = 'unload=*'
        return response
