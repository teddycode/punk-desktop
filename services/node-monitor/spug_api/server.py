import argparse
import os

from spug.runtime_paths import ensure_runtime_layout


def main():
    parser = argparse.ArgumentParser(description='Run the Spug API backend.')
    parser.add_argument('--host', default=os.environ.get('SPUG_HOST', '0.0.0.0'))
    parser.add_argument('--port', type=int, default=int(os.environ.get('SPUG_PORT', '8000')))
    args = parser.parse_args()

    ensure_runtime_layout()
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'spug.settings')

    import django
    django.setup()

    from apps.account.utils import ensure_default_admin
    from spug.services import start_embedded_services

    ensure_default_admin()
    start_embedded_services()

    import uvicorn
    uvicorn.run(
        'spug.asgi:application',
        host=args.host,
        port=args.port,
        factory=False,
        http='h11',
        ws='websockets',
        loop='asyncio',
        log_level='info',
    )


if __name__ == '__main__':
    main()
