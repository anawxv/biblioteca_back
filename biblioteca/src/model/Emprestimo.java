package model;

import java.util.Calendar;
import java.util.Date;

public class Emprestimo { 
	
	public Emprestimo() {
	 
	}

    private int idEmprestimo;
    private Cliente cliente;
    private Livro livro;
    private Date dataEmprestimo;
    private Date dataPrevistaDevolucao;
    private Date dataDevolucao;

  
    public Emprestimo(Cliente cliente, Livro livro) {
        this.cliente = cliente;
        this.livro = livro;
        this.dataEmprestimo = new Date(); 
        
     
        Calendar cal = Calendar.getInstance();
        cal.setTime(this.dataEmprestimo);
        cal.add(Calendar.DATE, 10); 
        this.dataPrevistaDevolucao = cal.getTime();
        
        livro.marcarEmprestado(); 
    }

    public void finalizar() {
        this.dataDevolucao = new Date();
        livro.marcarDisponivel();
    }

    public boolean verificarAtraso(Date dataAtual) {
        return dataDevolucao == null && dataAtual.after(dataPrevistaDevolucao);
    }
    


    public int getIdEmprestimo() { return idEmprestimo; }
    public void setIdEmprestimo(int idEmprestimo) { this.idEmprestimo = idEmprestimo; }
    public Cliente getCliente() { return cliente; }
    public Livro getLivro() { return livro; }
    public Date getDataEmprestimo() { return dataEmprestimo; }
    public Date getDataPrevistaDevolucao() { return dataPrevistaDevolucao; }
    public Date getDataDevolucao() { return dataDevolucao; }
    private double valorMulta;
    public double getValorMulta() {
        return valorMulta;
    }

	public void setDataPrevista(java.sql.Date date) {
		// TODO Auto-generated method stub
		
	}

	public void setDataDevolucao(java.sql.Date date) {
		// TODO Auto-generated method stub
		
	}

	public void setValorMulta(double double1) {
		// TODO Auto-generated method stub
		
	}
}
