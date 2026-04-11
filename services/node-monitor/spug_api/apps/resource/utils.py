def getResourceCmd(host):
    SHELL_SCRIPT_TEMP = """
        node_name=$(hostname);
        cpu_usage=$(top -b -n 1 | awk '/Cpu\(s\):/ {print 100 - $8}');
        memory_usage=$(free -m | awk '/Mem:/ {printf "%.1f", ($3/$2)*100}'); 
        total_memory=$(free -m | awk '/Mem:/ {print $2}'); 
        used_memory=$(free -m | awk '/Mem:/ {print $3}'); 
        free_memory=$(free -m | awk '/Mem:/ {print $4}'); 
        total_disk_space=$(df -h / | awk 'NR==2 {print $2}'); 
        used_disk_space=$(df -h / | awk 'NR==2 {print $3}'); 
        free_disk_space=$(df -h / | awk 'NR==2 {print $4}'); 
        disk_usage_percent=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%');
        echo "{\\\"node_name\\\":\\\"$node_name\\\",\\\"cpu_usage\\\":\\\"$cpu_usage\\\",\\\"memory_usage\\\":\\\"$memory_usage\\\",\\\"total_memory\\\":\\\"$total_memory\\\",\\\"used_memory\\\":\\\"$used_memory\\\",\\\"free_memory\\\":\\\"$free_memory\\\",\\\"total_disk_space\\\":\\\"$total_disk_space\\\",\\\"used_disk_space\\\":\\\"$used_disk_space\\\",\\\"free_disk_space\\\":\\\"$free_disk_space\\\",\\\"disk_usage_percent\\\":\\\"$disk_usage_percent\\\"}";
    """
    return SHELL_SCRIPT_TEMP