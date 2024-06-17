document.addEventListener('DOMContentLoaded', function() {
    // Находим все виджеты FilteredSelectMultiple
    const selects = document.querySelectorAll('.related-widget-wrapper select[multiple]');

    selects.forEach(select => {
        // Добавляем обработчик двойного щелчка для каждого виджета
        select.addEventListener('dblclick', function(event) {
            const option = event.target;
            if (option.tagName === 'OPTION') {
                // Переключаем состояние selected
                option.selected = !option.selected;
                // Обновляем внешний вид виджета
                const selectElement = option.parentElement;
                const event = new Event('change', { bubbles: true });
                selectElement.dispatchEvent(event);
            }
        });
    });
});
