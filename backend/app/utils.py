"""Small helpers shared across models and routes."""


def mask_secret(value):
    """
    Preview of a stored credential — enough to tell *which* value is saved
    without putting the whole thing on screen by default.
    """
    if not value:
        return ''
    if len(value) <= 8:
        return '•' * len(value)
    return f'{value[:4]}{"•" * 8}{value[-4:]}'
