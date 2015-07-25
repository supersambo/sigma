library(shiny)
library(sigma)

gexf <- system.file("examples/ediaspora.gexf.xml", package = "sigma")

ui = shinyUI(fluidPage(
  sidebarPanel(
      checkboxInput("drawEdges", "Draw Edges", value = TRUE),
      checkboxInput("drawNodes", "Draw Nodes", value = TRUE),

      textOutput("clickNode"),
      textOutput("overNode")
  ),
  mainPanel(
      sigmaOutput('sigma')
  )
))

server = function(input, output) {

    output$clickNode <- renderText({ 
         paste("clickNode:",input$clickNode)
    })

    output$overNode <- renderText({ 
         paste("overNode:",input$overNode)
    })


  output$sigma <- renderSigma(
    sigma(gexf, 
          drawEdges = input$drawEdges, 
          drawNodes = input$drawNodes)
  )
}

shinyApp(ui = ui, server = server)
