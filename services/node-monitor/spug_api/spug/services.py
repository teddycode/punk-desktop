import logging
import os
import threading


_started = False
_lock = threading.Lock()
_threads = []


def _services_enabled():
    value = os.environ.get('SPUG_START_EMBEDDED_SERVICES', '1').strip().lower()
    return value not in ('0', 'false', 'no', 'off')


def _run_service(name, service_cls):
    try:
        service_cls().run()
    except Exception:
        logging.exception('Embedded service %s crashed', name)


def start_embedded_services():
    global _started
    if not _services_enabled():
        logging.warning('Embedded services disabled by SPUG_START_EMBEDDED_SERVICES')
        return []

    with _lock:
        if _started:
            return list(_threads)

        from apps.exec.management.commands.runworker import Worker
        from apps.monitor.scheduler import Scheduler as MonitorScheduler
        from apps.schedule.scheduler import Scheduler as ScheduleScheduler

        services = (
            ('worker', Worker),
            ('schedule', ScheduleScheduler),
            ('monitor', MonitorScheduler),
        )
        for name, service_cls in services:
            thread = threading.Thread(
                target=_run_service,
                args=(name, service_cls),
                name=f'spug-{name}',
                daemon=True,
            )
            thread.start()
            _threads.append(thread)

        _started = True
        logging.warning('Embedded services started: worker, schedule, monitor')
        return list(_threads)
