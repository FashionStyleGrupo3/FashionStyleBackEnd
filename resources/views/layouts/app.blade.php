<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FASHIONSTYLE - @yield('title', 'Home')</title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
    <link rel="stylesheet" href="{{ asset('css/responsive.css') }}">
    <link rel="stylesheet" href="{{ asset('css/miniCarrito.css') }}">
    <link rel="stylesheet" href="{{ asset('css/asistente-ia.css') }}?v=2">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
    
    @livewireStyles
</head>
<body>
    <div id="id1"></div>
    
    @yield('content')

    <script src="{{ asset('js/cartStorage.js') }}"></script>
    <script src="{{ asset('js/miniCarrito.js') }}"></script>
    <script src="{{ asset('js/asistente-ia.js') }}?v=2"></script>
    
    @livewireScripts
</body>
</html>
